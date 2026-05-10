El present document detalla els punts on s'ha fet ús d'IA.

Les eines d'IA utilitzades han estat:
- ChatGPT: Per consultes concretes en punts concrets del codi i quan s' ha treballat sobre un únic archiu.
- GithubCopilot: Per revisions de codi on es vol que el model tingui el context total del projecte.

LLISTAT D'USOS:

ÚS 1:
- Eina: ChatGPT
- Pregunta/objectiu: Creació del model HISTORY.
- Prompt literal:
                "Nou model per a HISTORY. Ha de contenir:
                    - Id entrada a HISTORY
                    - Tip us d'acció: CREATE, MODIFY, STATUS, DELETE
                    - Tipus d'entitat sobre la que es fa la modificació: USER, ROUTE, POINT
                    - Vector de canvis: un altre objecte"
- Incoherències detectades: Calia ajustar l’estructura proposada a les convencions i relacions reals del projecte.
- Solució/adaptació manual: Homogeneïtzació de camps, revisió de coherència funcional i validació d’encaix amb models, serveis i rutes.

ÚS 2:
- Eina: ChatGPT
- Pregunta/objectiu: Creació del model CHANGE.
- Prompt literal:
                "Nou model per cada objecte del tipus CHANGE
                    - Id entrada de CHANGE
                    - Id que faci referencia a l'entrada en historial a la que correspon (referencia)
                    - Id que faci referencia a l'objecte modificat (referencia)
                    - Camp modificat: Nom del camp sobre el que s ha fet la modificació
                    - Valor del camp abans de modificar
                    - Valor del camp després de la modificación
                    - Data de la modificació"
- Incoherències detectades: Calia ajustar l’estructura proposada a les convencions i relacions reals del projecte.
- Solució/adaptació manual: Homogeneïtzació de camps, revisió de coherència funcional i validació d’encaix amb models, serveis i rutes. Afegeixo també l'enum dels tipus d'objecte i accions.

ÚS 3:
- Eina: GithubCopilot
- Pregunta/objectiu: Creació dels controllers de Change e History
- Prompt literal:
                "Revisa els nous models (History i Change) i crea els controladors seguint les convencions adoptades en els controladors de User, Route i Point"
- Incoherències detectades: ---
- Solució/adaptació manual: No s'han detectat incoherències ja que l'IA tenia molt de context i es tracta d'una feina prou repetitiva.

ÚS 4:
- Eina: GithubCopilot
- Pregunta/objectiu: Creació dels routes de Change e History
- Prompt literal:
                "Revisa els nous models (History i Change) i crea els routes seguint les convencions adoptades en els controladors de User, Route i Point"
- Incoherències detectades: ---
- Solució/adaptació manual: No s'han detectat incoherències ja que l'IA tenia molt de context i es tracta d'una feina prou repetitiva.

ÚS 5:
- Eina: GithubCopilot
- Pregunta/objectiu: Creació dels services de History
- Prompt literal:
                "Revisa els nous models (History i Change) i crea els services seguint les convencions adoptades en els controladors de User, Route i Point. Implementa també la paginació seguint les convencions adoptades amb anterioritat"
- Incoherències detectades: No ha fet bé el populate dels changes.
- Solució/adaptació manual: S'ha fet manualment el populate per tal de garantir que amb una única petició es poden rebre historial i canvis associats.

ÚS 6:
- Eina: GithubCopilot
- Pregunta/objectiu: Creació dels services de Change
- Prompt literal:
                "Revisa els nous models (History i Change) i crea els services seguint les convencions adoptades en els controladors de User, Route i Point."
- Incoherències detectades: Calia reforçar la coherència referencial entre Change i History i validar IDs/objectes per evitar registres empty.
- Solució/adaptació manual: S’ha ajustat la lògica de servei per sincronitzar history.changes en create/update/delete i s’ha afegit validació manual de dades d’entrada abans de persistir.

ÚS 7:
- Eina: GithubCopilot
- Pregunta/objectiu: Creació automàtica dels Changes
- Prompt literal:
                "Revisa els nous models (History i Change) així com també els serveis disponibles per users, routes i points. Afegeix la lògica de servei i validació necessaria per tal que, en cas que el camp hagi canviat, es crei un nou CHANGE"
- Incoherències detectades: Es detecta risc de sobre-registre (es generaven CHANGE també quan no hi havia canvi real) i inconsistencia en la comparació de valors complexos (ObjectId, dates o arrays).
- Solució/adaptació manual: S’ha aplicat validació prèvia de diferències reals camp a camp i normalització de valors abans de comparar, registrant només canvis efectius i mantenint coherència amb el model HISTORY.

REVISIÓ FINAL DE CODI AMB IA:
ÚS R1:
- Eina: GithubCopilot
- Pregunta/objectiu: Revisar el codi en busca de millores o simplificacions que poden haver estat omeses
- Prompt literal:
                "Arxiu Prompt Revisió"
- Millores proposades (més rellevant i considerada crítica per la IA): Falta de consistència, si es fa servir enum per verificar tipus de HISTORY i MODELS, és necessari fer-lo servir també quan s'indica el camp modificat.
- Solució/adaptació manual: No s'ha cregut convenient aplicar aquesta modificació atès que, quan s escali el projecte s hauria de modificar l'enum per tal q el history continues funcionant.