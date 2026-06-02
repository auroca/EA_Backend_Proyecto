import { config } from '../config/config';
import Logging from '../library/Logging';
import { ServiceResult } from '../types/ServiceResult';

type WeaviateRoute = {
    route_id: string;
    name?: string;
    description?: string;
    cover_image?: string;
    city?: string;
    country?: string;
    distance?: number;
    duration?: number;
    difficulty?: string;
    tags?: string[];
    _additional?: {
        score?: string;
        certainty?: number;
        distance?: number;
    };
};

type RecommendationResponse = {
    answer: string;
    routes: WeaviateRoute[];
    selectedRoute: WeaviateRoute | null;
};

type WeaviateGraphQLResponse = {
    data?: {
        Get?: Record<string, WeaviateRoute[]>;
    };
    errors?: { message?: string }[];
};

type LlmResponse = {
    response?: string;
};

const routeFields = `
    route_id
    name
    description
    cover_image
    city
    country
    distance
    duration
    difficulty
    tags
`;

const getWeaviateGraphqlUrl = () => `${config.weaviate.url.replace(/\/$/, '')}/v1/graphql`;

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const postJson = async <T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`POST ${url} failed with HTTP ${response.status}: ${responseText.slice(0, 300)}`);
    }

    return (await response.json()) as T;
};

const queryWeaviate = async (graphqlQuery: string, variables: Record<string, unknown>): Promise<WeaviateRoute[]> => {
    if (!config.weaviate.url || !config.weaviate.apiKey) {
        throw new Error('Missing Weaviate configuration');
    }

    const response = await postJson<WeaviateGraphQLResponse>(
        getWeaviateGraphqlUrl(),
        {
            query: graphqlQuery,
            variables
        },
        {
            Authorization: `Bearer ${config.weaviate.apiKey}`
        }
    );

    if (response.errors?.length) {
        throw new Error(response.errors.map((error) => error.message).join('; '));
    }

    return response.data?.Get?.[config.weaviate.routesCollection] ?? [];
};

const searchRoutesByNearText = (question: string, limit: number) => {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 10);
    const query = `
        query SearchRoutes($concepts: [String!]!) {
            Get {
                ${config.weaviate.routesCollection}(nearText: { concepts: $concepts } limit: ${safeLimit}) {
                    ${routeFields}
                    _additional {
                        certainty
                        distance
                    }
                }
            }
        }
    `;

    return queryWeaviate(query, { concepts: [question] });
};

const searchRoutesByBm25 = (question: string, limit: number) => {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 10);
    const query = `
        query SearchRoutes($query: String!) {
            Get {
                ${config.weaviate.routesCollection}(bm25: { query: $query } limit: ${safeLimit}) {
                    ${routeFields}
                    _additional {
                        score
                    }
                }
            }
        }
    `;

    return queryWeaviate(query, { query: question });
};

const searchRoutes = async (question: string, limit: number): Promise<WeaviateRoute[]> => {
    try {
        return await searchRoutesByNearText(question, limit);
    } catch (error) {
        Logging.warning('Weaviate nearText search failed, falling back to bm25', { error: errorMessage(error) });
        return searchRoutesByBm25(question, limit);
    }
};

const formatRouteForPrompt = (route: WeaviateRoute, index: number) => {
    const tags = Array.isArray(route.tags) && route.tags.length ? route.tags.join(', ') : 'Sin tags';

    return [
        `Ruta ${index + 1}:`,
        `ID: ${route.route_id}`,
        `Titulo: ${route.name ?? 'Sin titulo'}`,
        `Descripcion: ${route.description ?? 'Sin descripcion'}`,
        `Ubicacion: ${[route.city, route.country].filter(Boolean).join(', ') || 'Sin ubicacion'}`,
        `Distancia: ${route.distance ?? 'Sin distancia'} km`,
        `Duracion: ${route.duration ?? 'Sin duracion'} minutos`,
        `Dificultad: ${route.difficulty ?? 'Sin dificultad'}`,
        `Tags: ${tags}`
    ].join('\n');
};

const buildPrompt = (question: string, routes: WeaviateRoute[]) => {
    const routeText = routes.length ? routes.map(formatRouteForPrompt).join('\n\n') : 'No se encontraron rutas relevantes en Weaviate.';

    return [
        `EXPLICACION: Recomiendame, en base a las rutas que te facilito a continuacion, cuales se ajustan mas a: ${question}.`,
        '',
        `RUTAS: ${routeText}`,
        '',
        'RESPUESTA ESPERADA: Se espera que retornes:',
        '- Responde siempre en ingles, aunque la peticion del usuario este en otro idioma.',
        '- El id de la ruta que mas se ajuste a la peticion del usuario.',
        '- Un mensaje para el usuario del tipo: Hello, based on your request, I think the route that may interest you the most is route title (route id).',
        '- No retornes enlaces ni URLs. Despues del titulo escribe solo el id de la ruta entre parentesis.'
    ].join('\n');
};

const cleanAnswerLinks = (answer: string) => {
    return answer.replace(/\((?:https?:\/\/[^)\s]+\/)?route\.html\?id=([0-9a-fA-F]{24})\)/g, '($1)').replace(/\[([^\]]+)\]\((?:https?:\/\/[^)\s]+\/)?route\.html\?id=([0-9a-fA-F]{24})\)/g, '$1 ($2)');
};

const findSelectedRoute = (answer: string, routes: WeaviateRoute[]) => {
    return routes.find((route) => route.route_id && answer.includes(route.route_id)) ?? null;
};

const callLlm = async (prompt: string): Promise<string> => {
    const response = await postJson<LlmResponse>(config.ia.llmUrl, {
        model: config.ia.llmModel,
        prompt,
        stream: false
    });

    return response.response?.trim() || '';
};

const recommend = async (question: string, limit = config.ia.routeSearchLimit): Promise<ServiceResult<RecommendationResponse>> => {
    try {
        const routes = await searchRoutes(question, limit);
        const prompt = buildPrompt(question, routes);
        const answer = cleanAnswerLinks(await callLlm(prompt));

        if (!answer) {
            return { success: false, error: 'LLM returned an empty response', statusCode: 502 };
        }

        const selectedRoute = findSelectedRoute(answer, routes);

        return {
            success: true,
            data: {
                answer,
                routes,
                selectedRoute
            }
        };
    } catch (error) {
        const message = errorMessage(error);
        Logging.error('IA recommendation service error', { error: message });

        if (message.includes('Missing Weaviate configuration')) {
            return { success: false, error: 'Missing Weaviate configuration. Check WEAVIATE_URL and WEAVIATE_API_KEY.', statusCode: 503 };
        }

        if (message.includes(config.ia.llmUrl)) {
            return { success: false, error: 'UPC LLM service is unavailable or returned an error.', statusCode: 502 };
        }

        return { success: false, error: 'IA recommendation service error', statusCode: 503 };
    }
};

export default {
    recommend
};
