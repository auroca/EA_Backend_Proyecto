import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User';
import Logging from '../library/Logging';

dotenv.config();

type SeedUser = {
    _id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    enabled: boolean;
    role: 'admin' | 'user';
};

const SEED_USERS: SeedUser[] = [
    { _id: '65f000000000000000000000', name: 'Admin', surname: 'Admin', username: 'admin', email: 'admin@admin.com', password: 'AdminPass001!', enabled: true, role: 'admin' },
    { _id: '65f000000000000000000001', name: 'Juan', surname: 'Garcia', username: 'seed.user001', email: 'seed.user001.t2g@yopmail.com', password: 'SeedPass001!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000002', name: 'Maria', surname: 'Gonzalez', username: 'seed.user002', email: 'seed.user002.t2g@yopmail.com', password: 'SeedPass002!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000003', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user003', email: 'seed.user003.t2g@yopmail.com', password: 'SeedPass003!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000004', name: 'Ana', surname: 'Martinez', username: 'seed.user004', email: 'seed.user004.t2g@yopmail.com', password: 'SeedPass004!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000005', name: 'Luis', surname: 'Hernandez', username: 'seed.user005', email: 'seed.user005.t2g@yopmail.com', password: 'SeedPass005!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000006', name: 'Sofia', surname: 'Lopez', username: 'seed.user006', email: 'seed.user006.t2g@yopmail.com', password: 'SeedPass006!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000007', name: 'Pedro', surname: 'Sanchez', username: 'seed.user007', email: 'seed.user007.t2g@yopmail.com', password: 'SeedPass007!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000008', name: 'Isabel', surname: 'Perez', username: 'seed.user008', email: 'seed.user008.t2g@yopmail.com', password: 'SeedPass008!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000009', name: 'Miguel', surname: 'Torres', username: 'seed.user009', email: 'seed.user009.t2g@yopmail.com', password: 'SeedPass009!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000000a', name: 'Elena', surname: 'Ramirez', username: 'seed.user010', email: 'seed.user010.t2g@yopmail.com', password: 'SeedPass010!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000000b', name: 'Antonio', surname: 'Garcia', username: 'seed.user011', email: 'seed.user011.t2g@yopmail.com', password: 'SeedPass011!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000000c', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user012', email: 'seed.user012.t2g@yopmail.com', password: 'SeedPass012!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000000d', name: 'Diego', surname: 'Rodriguez', username: 'seed.user013', email: 'seed.user013.t2g@yopmail.com', password: 'SeedPass013!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000000e', name: 'Carmen', surname: 'Martinez', username: 'seed.user014', email: 'seed.user014.t2g@yopmail.com', password: 'SeedPass014!', enabled: true, role: 'user' },
    {
        _id: '65f00000000000000000000f',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user015',
        email: 'seed.user015.t2g@yopmail.com',
        password: 'SeedPass015!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000010', name: 'Laura', surname: 'Lopez', username: 'seed.user016', email: 'seed.user016.t2g@yopmail.com', password: 'SeedPass016!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000011', name: 'Fernando', surname: 'Sanchez', username: 'seed.user017', email: 'seed.user017.t2g@yopmail.com', password: 'SeedPass017!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000012', name: 'Pilar', surname: 'Perez', username: 'seed.user018', email: 'seed.user018.t2g@yopmail.com', password: 'SeedPass018!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000013', name: 'Ricardo', surname: 'Torres', username: 'seed.user019', email: 'seed.user019.t2g@yopmail.com', password: 'SeedPass019!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000014', name: 'Valentina', surname: 'Ramirez', username: 'seed.user020', email: 'seed.user020.t2g@yopmail.com', password: 'SeedPass020!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000015', name: 'Juan', surname: 'Garcia', username: 'seed.user021', email: 'seed.user021.t2g@yopmail.com', password: 'SeedPass021!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000016', name: 'Maria', surname: 'Gonzalez', username: 'seed.user022', email: 'seed.user022.t2g@yopmail.com', password: 'SeedPass022!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000017', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user023', email: 'seed.user023.t2g@yopmail.com', password: 'SeedPass023!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000018', name: 'Ana', surname: 'Martinez', username: 'seed.user024', email: 'seed.user024.t2g@yopmail.com', password: 'SeedPass024!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000019', name: 'Luis', surname: 'Hernandez', username: 'seed.user025', email: 'seed.user025.t2g@yopmail.com', password: 'SeedPass025!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001a', name: 'Sofia', surname: 'Lopez', username: 'seed.user026', email: 'seed.user026.t2g@yopmail.com', password: 'SeedPass026!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001b', name: 'Pedro', surname: 'Sanchez', username: 'seed.user027', email: 'seed.user027.t2g@yopmail.com', password: 'SeedPass027!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001c', name: 'Isabel', surname: 'Perez', username: 'seed.user028', email: 'seed.user028.t2g@yopmail.com', password: 'SeedPass028!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001d', name: 'Miguel', surname: 'Torres', username: 'seed.user029', email: 'seed.user029.t2g@yopmail.com', password: 'SeedPass029!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001e', name: 'Elena', surname: 'Ramirez', username: 'seed.user030', email: 'seed.user030.t2g@yopmail.com', password: 'SeedPass030!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000001f', name: 'Antonio', surname: 'Garcia', username: 'seed.user031', email: 'seed.user031.t2g@yopmail.com', password: 'SeedPass031!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000020', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user032', email: 'seed.user032.t2g@yopmail.com', password: 'SeedPass032!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000021', name: 'Diego', surname: 'Rodriguez', username: 'seed.user033', email: 'seed.user033.t2g@yopmail.com', password: 'SeedPass033!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000022', name: 'Carmen', surname: 'Martinez', username: 'seed.user034', email: 'seed.user034.t2g@yopmail.com', password: 'SeedPass034!', enabled: true, role: 'user' },
    {
        _id: '65f000000000000000000023',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user035',
        email: 'seed.user035.t2g@yopmail.com',
        password: 'SeedPass035!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000024', name: 'Laura', surname: 'Lopez', username: 'seed.user036', email: 'seed.user036.t2g@yopmail.com', password: 'SeedPass036!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000025', name: 'Fernando', surname: 'Sanchez', username: 'seed.user037', email: 'seed.user037.t2g@yopmail.com', password: 'SeedPass037!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000026', name: 'Pilar', surname: 'Perez', username: 'seed.user038', email: 'seed.user038.t2g@yopmail.com', password: 'SeedPass038!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000027', name: 'Ricardo', surname: 'Torres', username: 'seed.user039', email: 'seed.user039.t2g@yopmail.com', password: 'SeedPass039!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000028', name: 'Valentina', surname: 'Ramirez', username: 'seed.user040', email: 'seed.user040.t2g@yopmail.com', password: 'SeedPass040!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000029', name: 'Juan', surname: 'Garcia', username: 'seed.user041', email: 'seed.user041.t2g@yopmail.com', password: 'SeedPass041!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002a', name: 'Maria', surname: 'Gonzalez', username: 'seed.user042', email: 'seed.user042.t2g@yopmail.com', password: 'SeedPass042!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002b', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user043', email: 'seed.user043.t2g@yopmail.com', password: 'SeedPass043!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002c', name: 'Ana', surname: 'Martinez', username: 'seed.user044', email: 'seed.user044.t2g@yopmail.com', password: 'SeedPass044!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002d', name: 'Luis', surname: 'Hernandez', username: 'seed.user045', email: 'seed.user045.t2g@yopmail.com', password: 'SeedPass045!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002e', name: 'Sofia', surname: 'Lopez', username: 'seed.user046', email: 'seed.user046.t2g@yopmail.com', password: 'SeedPass046!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000002f', name: 'Pedro', surname: 'Sanchez', username: 'seed.user047', email: 'seed.user047.t2g@yopmail.com', password: 'SeedPass047!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000030', name: 'Isabel', surname: 'Perez', username: 'seed.user048', email: 'seed.user048.t2g@yopmail.com', password: 'SeedPass048!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000031', name: 'Miguel', surname: 'Torres', username: 'seed.user049', email: 'seed.user049.t2g@yopmail.com', password: 'SeedPass049!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000032', name: 'Elena', surname: 'Ramirez', username: 'seed.user050', email: 'seed.user050.t2g@yopmail.com', password: 'SeedPass050!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000033', name: 'Antonio', surname: 'Garcia', username: 'seed.user051', email: 'seed.user051.t2g@yopmail.com', password: 'SeedPass051!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000034', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user052', email: 'seed.user052.t2g@yopmail.com', password: 'SeedPass052!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000035', name: 'Diego', surname: 'Rodriguez', username: 'seed.user053', email: 'seed.user053.t2g@yopmail.com', password: 'SeedPass053!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000036', name: 'Carmen', surname: 'Martinez', username: 'seed.user054', email: 'seed.user054.t2g@yopmail.com', password: 'SeedPass054!', enabled: true, role: 'user' },
    {
        _id: '65f000000000000000000037',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user055',
        email: 'seed.user055.t2g@yopmail.com',
        password: 'SeedPass055!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000038', name: 'Laura', surname: 'Lopez', username: 'seed.user056', email: 'seed.user056.t2g@yopmail.com', password: 'SeedPass056!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000039', name: 'Fernando', surname: 'Sanchez', username: 'seed.user057', email: 'seed.user057.t2g@yopmail.com', password: 'SeedPass057!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003a', name: 'Pilar', surname: 'Perez', username: 'seed.user058', email: 'seed.user058.t2g@yopmail.com', password: 'SeedPass058!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003b', name: 'Ricardo', surname: 'Torres', username: 'seed.user059', email: 'seed.user059.t2g@yopmail.com', password: 'SeedPass059!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003c', name: 'Valentina', surname: 'Ramirez', username: 'seed.user060', email: 'seed.user060.t2g@yopmail.com', password: 'SeedPass060!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003d', name: 'Juan', surname: 'Garcia', username: 'seed.user061', email: 'seed.user061.t2g@yopmail.com', password: 'SeedPass061!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003e', name: 'Maria', surname: 'Gonzalez', username: 'seed.user062', email: 'seed.user062.t2g@yopmail.com', password: 'SeedPass062!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000003f', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user063', email: 'seed.user063.t2g@yopmail.com', password: 'SeedPass063!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000040', name: 'Ana', surname: 'Martinez', username: 'seed.user064', email: 'seed.user064.t2g@yopmail.com', password: 'SeedPass064!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000041', name: 'Luis', surname: 'Hernandez', username: 'seed.user065', email: 'seed.user065.t2g@yopmail.com', password: 'SeedPass065!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000042', name: 'Sofia', surname: 'Lopez', username: 'seed.user066', email: 'seed.user066.t2g@yopmail.com', password: 'SeedPass066!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000043', name: 'Pedro', surname: 'Sanchez', username: 'seed.user067', email: 'seed.user067.t2g@yopmail.com', password: 'SeedPass067!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000044', name: 'Isabel', surname: 'Perez', username: 'seed.user068', email: 'seed.user068.t2g@yopmail.com', password: 'SeedPass068!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000045', name: 'Miguel', surname: 'Torres', username: 'seed.user069', email: 'seed.user069.t2g@yopmail.com', password: 'SeedPass069!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000046', name: 'Elena', surname: 'Ramirez', username: 'seed.user070', email: 'seed.user070.t2g@yopmail.com', password: 'SeedPass070!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000047', name: 'Antonio', surname: 'Garcia', username: 'seed.user071', email: 'seed.user071.t2g@yopmail.com', password: 'SeedPass071!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000048', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user072', email: 'seed.user072.t2g@yopmail.com', password: 'SeedPass072!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000049', name: 'Diego', surname: 'Rodriguez', username: 'seed.user073', email: 'seed.user073.t2g@yopmail.com', password: 'SeedPass073!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000004a', name: 'Carmen', surname: 'Martinez', username: 'seed.user074', email: 'seed.user074.t2g@yopmail.com', password: 'SeedPass074!', enabled: true, role: 'user' },
    {
        _id: '65f00000000000000000004b',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user075',
        email: 'seed.user075.t2g@yopmail.com',
        password: 'SeedPass075!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f00000000000000000004c', name: 'Laura', surname: 'Lopez', username: 'seed.user076', email: 'seed.user076.t2g@yopmail.com', password: 'SeedPass076!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000004d', name: 'Fernando', surname: 'Sanchez', username: 'seed.user077', email: 'seed.user077.t2g@yopmail.com', password: 'SeedPass077!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000004e', name: 'Pilar', surname: 'Perez', username: 'seed.user078', email: 'seed.user078.t2g@yopmail.com', password: 'SeedPass078!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000004f', name: 'Ricardo', surname: 'Torres', username: 'seed.user079', email: 'seed.user079.t2g@yopmail.com', password: 'SeedPass079!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000050', name: 'Valentina', surname: 'Ramirez', username: 'seed.user080', email: 'seed.user080.t2g@yopmail.com', password: 'SeedPass080!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000051', name: 'Juan', surname: 'Garcia', username: 'seed.user081', email: 'seed.user081.t2g@yopmail.com', password: 'SeedPass081!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000052', name: 'Maria', surname: 'Gonzalez', username: 'seed.user082', email: 'seed.user082.t2g@yopmail.com', password: 'SeedPass082!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000053', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user083', email: 'seed.user083.t2g@yopmail.com', password: 'SeedPass083!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000054', name: 'Ana', surname: 'Martinez', username: 'seed.user084', email: 'seed.user084.t2g@yopmail.com', password: 'SeedPass084!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000055', name: 'Luis', surname: 'Hernandez', username: 'seed.user085', email: 'seed.user085.t2g@yopmail.com', password: 'SeedPass085!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000056', name: 'Sofia', surname: 'Lopez', username: 'seed.user086', email: 'seed.user086.t2g@yopmail.com', password: 'SeedPass086!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000057', name: 'Pedro', surname: 'Sanchez', username: 'seed.user087', email: 'seed.user087.t2g@yopmail.com', password: 'SeedPass087!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000058', name: 'Isabel', surname: 'Perez', username: 'seed.user088', email: 'seed.user088.t2g@yopmail.com', password: 'SeedPass088!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000059', name: 'Miguel', surname: 'Torres', username: 'seed.user089', email: 'seed.user089.t2g@yopmail.com', password: 'SeedPass089!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000005a', name: 'Elena', surname: 'Ramirez', username: 'seed.user090', email: 'seed.user090.t2g@yopmail.com', password: 'SeedPass090!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000005b', name: 'Antonio', surname: 'Garcia', username: 'seed.user091', email: 'seed.user091.t2g@yopmail.com', password: 'SeedPass091!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000005c', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user092', email: 'seed.user092.t2g@yopmail.com', password: 'SeedPass092!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000005d', name: 'Diego', surname: 'Rodriguez', username: 'seed.user093', email: 'seed.user093.t2g@yopmail.com', password: 'SeedPass093!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000005e', name: 'Carmen', surname: 'Martinez', username: 'seed.user094', email: 'seed.user094.t2g@yopmail.com', password: 'SeedPass094!', enabled: true, role: 'user' },
    {
        _id: '65f00000000000000000005f',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user095',
        email: 'seed.user095.t2g@yopmail.com',
        password: 'SeedPass095!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000060', name: 'Laura', surname: 'Lopez', username: 'seed.user096', email: 'seed.user096.t2g@yopmail.com', password: 'SeedPass096!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000061', name: 'Fernando', surname: 'Sanchez', username: 'seed.user097', email: 'seed.user097.t2g@yopmail.com', password: 'SeedPass097!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000062', name: 'Pilar', surname: 'Perez', username: 'seed.user098', email: 'seed.user098.t2g@yopmail.com', password: 'SeedPass098!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000063', name: 'Ricardo', surname: 'Torres', username: 'seed.user099', email: 'seed.user099.t2g@yopmail.com', password: 'SeedPass099!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000064', name: 'Valentina', surname: 'Ramirez', username: 'seed.user100', email: 'seed.user100.t2g@yopmail.com', password: 'SeedPass100!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000065', name: 'Juan', surname: 'Garcia', username: 'seed.user101', email: 'seed.user101.t2g@yopmail.com', password: 'SeedPass101!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000066', name: 'Maria', surname: 'Gonzalez', username: 'seed.user102', email: 'seed.user102.t2g@yopmail.com', password: 'SeedPass102!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000067', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user103', email: 'seed.user103.t2g@yopmail.com', password: 'SeedPass103!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000068', name: 'Ana', surname: 'Martinez', username: 'seed.user104', email: 'seed.user104.t2g@yopmail.com', password: 'SeedPass104!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000069', name: 'Luis', surname: 'Hernandez', username: 'seed.user105', email: 'seed.user105.t2g@yopmail.com', password: 'SeedPass105!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006a', name: 'Sofia', surname: 'Lopez', username: 'seed.user106', email: 'seed.user106.t2g@yopmail.com', password: 'SeedPass106!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006b', name: 'Pedro', surname: 'Sanchez', username: 'seed.user107', email: 'seed.user107.t2g@yopmail.com', password: 'SeedPass107!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006c', name: 'Isabel', surname: 'Perez', username: 'seed.user108', email: 'seed.user108.t2g@yopmail.com', password: 'SeedPass108!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006d', name: 'Miguel', surname: 'Torres', username: 'seed.user109', email: 'seed.user109.t2g@yopmail.com', password: 'SeedPass109!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006e', name: 'Elena', surname: 'Ramirez', username: 'seed.user110', email: 'seed.user110.t2g@yopmail.com', password: 'SeedPass110!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000006f', name: 'Antonio', surname: 'Garcia', username: 'seed.user111', email: 'seed.user111.t2g@yopmail.com', password: 'SeedPass111!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000070', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user112', email: 'seed.user112.t2g@yopmail.com', password: 'SeedPass112!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000071', name: 'Diego', surname: 'Rodriguez', username: 'seed.user113', email: 'seed.user113.t2g@yopmail.com', password: 'SeedPass113!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000072', name: 'Carmen', surname: 'Martinez', username: 'seed.user114', email: 'seed.user114.t2g@yopmail.com', password: 'SeedPass114!', enabled: true, role: 'user' },
    {
        _id: '65f000000000000000000073',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user115',
        email: 'seed.user115.t2g@yopmail.com',
        password: 'SeedPass115!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000074', name: 'Laura', surname: 'Lopez', username: 'seed.user116', email: 'seed.user116.t2g@yopmail.com', password: 'SeedPass116!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000075', name: 'Fernando', surname: 'Sanchez', username: 'seed.user117', email: 'seed.user117.t2g@yopmail.com', password: 'SeedPass117!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000076', name: 'Pilar', surname: 'Perez', username: 'seed.user118', email: 'seed.user118.t2g@yopmail.com', password: 'SeedPass118!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000077', name: 'Ricardo', surname: 'Torres', username: 'seed.user119', email: 'seed.user119.t2g@yopmail.com', password: 'SeedPass119!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000078', name: 'Valentina', surname: 'Ramirez', username: 'seed.user120', email: 'seed.user120.t2g@yopmail.com', password: 'SeedPass120!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000079', name: 'Juan', surname: 'Garcia', username: 'seed.user121', email: 'seed.user121.t2g@yopmail.com', password: 'SeedPass121!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007a', name: 'Maria', surname: 'Gonzalez', username: 'seed.user122', email: 'seed.user122.t2g@yopmail.com', password: 'SeedPass122!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007b', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user123', email: 'seed.user123.t2g@yopmail.com', password: 'SeedPass123!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007c', name: 'Ana', surname: 'Martinez', username: 'seed.user124', email: 'seed.user124.t2g@yopmail.com', password: 'SeedPass124!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007d', name: 'Luis', surname: 'Hernandez', username: 'seed.user125', email: 'seed.user125.t2g@yopmail.com', password: 'SeedPass125!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007e', name: 'Sofia', surname: 'Lopez', username: 'seed.user126', email: 'seed.user126.t2g@yopmail.com', password: 'SeedPass126!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000007f', name: 'Pedro', surname: 'Sanchez', username: 'seed.user127', email: 'seed.user127.t2g@yopmail.com', password: 'SeedPass127!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000080', name: 'Isabel', surname: 'Perez', username: 'seed.user128', email: 'seed.user128.t2g@yopmail.com', password: 'SeedPass128!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000081', name: 'Miguel', surname: 'Torres', username: 'seed.user129', email: 'seed.user129.t2g@yopmail.com', password: 'SeedPass129!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000082', name: 'Elena', surname: 'Ramirez', username: 'seed.user130', email: 'seed.user130.t2g@yopmail.com', password: 'SeedPass130!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000083', name: 'Antonio', surname: 'Garcia', username: 'seed.user131', email: 'seed.user131.t2g@yopmail.com', password: 'SeedPass131!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000084', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user132', email: 'seed.user132.t2g@yopmail.com', password: 'SeedPass132!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000085', name: 'Diego', surname: 'Rodriguez', username: 'seed.user133', email: 'seed.user133.t2g@yopmail.com', password: 'SeedPass133!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000086', name: 'Carmen', surname: 'Martinez', username: 'seed.user134', email: 'seed.user134.t2g@yopmail.com', password: 'SeedPass134!', enabled: true, role: 'user' },
    {
        _id: '65f000000000000000000087',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user135',
        email: 'seed.user135.t2g@yopmail.com',
        password: 'SeedPass135!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f000000000000000000088', name: 'Laura', surname: 'Lopez', username: 'seed.user136', email: 'seed.user136.t2g@yopmail.com', password: 'SeedPass136!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000089', name: 'Fernando', surname: 'Sanchez', username: 'seed.user137', email: 'seed.user137.t2g@yopmail.com', password: 'SeedPass137!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008a', name: 'Pilar', surname: 'Perez', username: 'seed.user138', email: 'seed.user138.t2g@yopmail.com', password: 'SeedPass138!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008b', name: 'Ricardo', surname: 'Torres', username: 'seed.user139', email: 'seed.user139.t2g@yopmail.com', password: 'SeedPass139!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008c', name: 'Valentina', surname: 'Ramirez', username: 'seed.user140', email: 'seed.user140.t2g@yopmail.com', password: 'SeedPass140!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008d', name: 'Juan', surname: 'Garcia', username: 'seed.user141', email: 'seed.user141.t2g@yopmail.com', password: 'SeedPass141!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008e', name: 'Maria', surname: 'Gonzalez', username: 'seed.user142', email: 'seed.user142.t2g@yopmail.com', password: 'SeedPass142!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000008f', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user143', email: 'seed.user143.t2g@yopmail.com', password: 'SeedPass143!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000090', name: 'Ana', surname: 'Martinez', username: 'seed.user144', email: 'seed.user144.t2g@yopmail.com', password: 'SeedPass144!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000091', name: 'Luis', surname: 'Hernandez', username: 'seed.user145', email: 'seed.user145.t2g@yopmail.com', password: 'SeedPass145!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000092', name: 'Sofia', surname: 'Lopez', username: 'seed.user146', email: 'seed.user146.t2g@yopmail.com', password: 'SeedPass146!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000093', name: 'Pedro', surname: 'Sanchez', username: 'seed.user147', email: 'seed.user147.t2g@yopmail.com', password: 'SeedPass147!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000094', name: 'Isabel', surname: 'Perez', username: 'seed.user148', email: 'seed.user148.t2g@yopmail.com', password: 'SeedPass148!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000095', name: 'Miguel', surname: 'Torres', username: 'seed.user149', email: 'seed.user149.t2g@yopmail.com', password: 'SeedPass149!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000096', name: 'Elena', surname: 'Ramirez', username: 'seed.user150', email: 'seed.user150.t2g@yopmail.com', password: 'SeedPass150!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000097', name: 'Antonio', surname: 'Garcia', username: 'seed.user151', email: 'seed.user151.t2g@yopmail.com', password: 'SeedPass151!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000098', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user152', email: 'seed.user152.t2g@yopmail.com', password: 'SeedPass152!', enabled: true, role: 'user' },
    { _id: '65f000000000000000000099', name: 'Diego', surname: 'Rodriguez', username: 'seed.user153', email: 'seed.user153.t2g@yopmail.com', password: 'SeedPass153!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000009a', name: 'Carmen', surname: 'Martinez', username: 'seed.user154', email: 'seed.user154.t2g@yopmail.com', password: 'SeedPass154!', enabled: true, role: 'user' },
    {
        _id: '65f00000000000000000009b',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user155',
        email: 'seed.user155.t2g@yopmail.com',
        password: 'SeedPass155!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f00000000000000000009c', name: 'Laura', surname: 'Lopez', username: 'seed.user156', email: 'seed.user156.t2g@yopmail.com', password: 'SeedPass156!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000009d', name: 'Fernando', surname: 'Sanchez', username: 'seed.user157', email: 'seed.user157.t2g@yopmail.com', password: 'SeedPass157!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000009e', name: 'Pilar', surname: 'Perez', username: 'seed.user158', email: 'seed.user158.t2g@yopmail.com', password: 'SeedPass158!', enabled: true, role: 'user' },
    { _id: '65f00000000000000000009f', name: 'Ricardo', surname: 'Torres', username: 'seed.user159', email: 'seed.user159.t2g@yopmail.com', password: 'SeedPass159!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a0', name: 'Valentina', surname: 'Ramirez', username: 'seed.user160', email: 'seed.user160.t2g@yopmail.com', password: 'SeedPass160!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a1', name: 'Juan', surname: 'Garcia', username: 'seed.user161', email: 'seed.user161.t2g@yopmail.com', password: 'SeedPass161!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a2', name: 'Maria', surname: 'Gonzalez', username: 'seed.user162', email: 'seed.user162.t2g@yopmail.com', password: 'SeedPass162!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a3', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user163', email: 'seed.user163.t2g@yopmail.com', password: 'SeedPass163!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a4', name: 'Ana', surname: 'Martinez', username: 'seed.user164', email: 'seed.user164.t2g@yopmail.com', password: 'SeedPass164!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a5', name: 'Luis', surname: 'Hernandez', username: 'seed.user165', email: 'seed.user165.t2g@yopmail.com', password: 'SeedPass165!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a6', name: 'Sofia', surname: 'Lopez', username: 'seed.user166', email: 'seed.user166.t2g@yopmail.com', password: 'SeedPass166!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a7', name: 'Pedro', surname: 'Sanchez', username: 'seed.user167', email: 'seed.user167.t2g@yopmail.com', password: 'SeedPass167!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a8', name: 'Isabel', surname: 'Perez', username: 'seed.user168', email: 'seed.user168.t2g@yopmail.com', password: 'SeedPass168!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000a9', name: 'Miguel', surname: 'Torres', username: 'seed.user169', email: 'seed.user169.t2g@yopmail.com', password: 'SeedPass169!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000aa', name: 'Elena', surname: 'Ramirez', username: 'seed.user170', email: 'seed.user170.t2g@yopmail.com', password: 'SeedPass170!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000ab', name: 'Antonio', surname: 'Garcia', username: 'seed.user171', email: 'seed.user171.t2g@yopmail.com', password: 'SeedPass171!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000ac', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user172', email: 'seed.user172.t2g@yopmail.com', password: 'SeedPass172!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000ad', name: 'Diego', surname: 'Rodriguez', username: 'seed.user173', email: 'seed.user173.t2g@yopmail.com', password: 'SeedPass173!', enabled: true, role: 'user' },
    { _id: '65f0000000000000000000ae', name: 'Carmen', surname: 'Martinez', username: 'seed.user174', email: 'seed.user174.t2g@yopmail.com', password: 'SeedPass174!', enabled: true, role: 'user' },
    {
        _id: '65f0000000000000000000af',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user175',
        email: 'seed.user175.t2g@yopmail.com',
        password: 'SeedPass175!',
        enabled: true,
        role: 'user'
    },
    { _id: '65f0000000000000000000b0', name: 'Laura', surname: 'Lopez', username: 'seed.user176', email: 'seed.user176.t2g@yopmail.com', password: 'SeedPass176!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b1', name: 'Fernando', surname: 'Sanchez', username: 'seed.user177', email: 'seed.user177.t2g@yopmail.com', password: 'SeedPass177!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b2', name: 'Pilar', surname: 'Perez', username: 'seed.user178', email: 'seed.user178.t2g@yopmail.com', password: 'SeedPass178!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b3', name: 'Ricardo', surname: 'Torres', username: 'seed.user179', email: 'seed.user179.t2g@yopmail.com', password: 'SeedPass179!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b4', name: 'Valentina', surname: 'Ramirez', username: 'seed.user180', email: 'seed.user180.t2g@yopmail.com', password: 'SeedPass180!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b5', name: 'Juan', surname: 'Garcia', username: 'seed.user181', email: 'seed.user181.t2g@yopmail.com', password: 'SeedPass181!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b6', name: 'Maria', surname: 'Gonzalez', username: 'seed.user182', email: 'seed.user182.t2g@yopmail.com', password: 'SeedPass182!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b7', name: 'Carlos', surname: 'Rodriguez', username: 'seed.user183', email: 'seed.user183.t2g@yopmail.com', password: 'SeedPass183!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b8', name: 'Ana', surname: 'Martinez', username: 'seed.user184', email: 'seed.user184.t2g@yopmail.com', password: 'SeedPass184!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000b9', name: 'Luis', surname: 'Hernandez', username: 'seed.user185', email: 'seed.user185.t2g@yopmail.com', password: 'SeedPass185!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000ba', name: 'Sofia', surname: 'Lopez', username: 'seed.user186', email: 'seed.user186.t2g@yopmail.com', password: 'SeedPass186!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000bb', name: 'Pedro', surname: 'Sanchez', username: 'seed.user187', email: 'seed.user187.t2g@yopmail.com', password: 'SeedPass187!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000bc', name: 'Isabel', surname: 'Perez', username: 'seed.user188', email: 'seed.user188.t2g@yopmail.com', password: 'SeedPass188!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000bd', name: 'Miguel', surname: 'Torres', username: 'seed.user189', email: 'seed.user189.t2g@yopmail.com', password: 'SeedPass189!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000be', name: 'Elena', surname: 'Ramirez', username: 'seed.user190', email: 'seed.user190.t2g@yopmail.com', password: 'SeedPass190!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000bf', name: 'Antonio', surname: 'Garcia', username: 'seed.user191', email: 'seed.user191.t2g@yopmail.com', password: 'SeedPass191!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c0', name: 'Rosa', surname: 'Gonzalez', username: 'seed.user192', email: 'seed.user192.t2g@yopmail.com', password: 'SeedPass192!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c1', name: 'Diego', surname: 'Rodriguez', username: 'seed.user193', email: 'seed.user193.t2g@yopmail.com', password: 'SeedPass193!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c2', name: 'Carmen', surname: 'Martinez', username: 'seed.user194', email: 'seed.user194.t2g@yopmail.com', password: 'SeedPass194!', enabled: false, role: 'user' },
    {
        _id: '65f0000000000000000000c3',
        name: 'Francisco',
        surname: 'Hernandez',
        username: 'seed.user195',
        email: 'seed.user195.t2g@yopmail.com',
        password: 'SeedPass195!',
        enabled: false,
        role: 'user'
    },
    { _id: '65f0000000000000000000c4', name: 'Laura', surname: 'Lopez', username: 'seed.user196', email: 'seed.user196.t2g@yopmail.com', password: 'SeedPass196!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c5', name: 'Fernando', surname: 'Sanchez', username: 'seed.user197', email: 'seed.user197.t2g@yopmail.com', password: 'SeedPass197!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c6', name: 'Pilar', surname: 'Perez', username: 'seed.user198', email: 'seed.user198.t2g@yopmail.com', password: 'SeedPass198!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c7', name: 'Ricardo', surname: 'Torres', username: 'seed.user199', email: 'seed.user199.t2g@yopmail.com', password: 'SeedPass199!', enabled: false, role: 'user' },
    { _id: '65f0000000000000000000c8', name: 'Valentina', surname: 'Ramirez', username: 'seed.user200', email: 'seed.user200.t2g@yopmail.com', password: 'SeedPass200!', enabled: false, role: 'user' }
];

async function seedUsers() {
    try {
        const MONGO_URL = process.env.MONGO_URI || '';
        if (!MONGO_URL) {
            throw new Error('MONGO_URI is not configured in .env');
        }

        await mongoose.connect(MONGO_URL, { retryWrites: true, w: 'majority' });
        Logging.info('MongoDB connection established');

        await User.deleteMany({});
        Logging.info('Users collection cleared');

        const usersToInsert = await Promise.all(
            SEED_USERS.map(async (user) => ({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                password: await bcrypt.hash(user.password, 10),
                enabled: user.enabled,
                role: user.role
            }))
        );

        const result = await User.insertMany(usersToInsert);
        Logging.info('' + result.length + ' users created successfully');
        Logging.info('  - 175 users with enabled = true');
        Logging.info('  - 25 users with enabled = false');
        Logging.info('  - 200 users with role = user');
        Logging.info('  - 1 user with role = admin');
        Logging.info('  - Email format: seed.userXXX.t2g@yopmail.com');

        process.exit(0);
    } catch (error) {
        Logging.error(`Error creating users: ${error}`);
        process.exit(1);
    }
}

seedUsers();
