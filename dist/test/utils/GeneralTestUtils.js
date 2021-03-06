"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const typeorm_1 = require("typeorm");
const ts = require("typescript");
const yn = require("yn");
const MariaDbDriver_1 = require("../../src/drivers/MariaDbDriver");
const MssqlDriver_1 = require("../../src/drivers/MssqlDriver");
const MysqlDriver_1 = require("../../src/drivers/MysqlDriver");
const OracleDriver_1 = require("../../src/drivers/OracleDriver");
const PostgresDriver_1 = require("../../src/drivers/PostgresDriver");
const SqliteDriver_1 = require("../../src/drivers/SqliteDriver");
function getGenerationOptions(resultsPath) {
    return {
        resultsPath: resultsPath,
        noConfigs: false,
        convertCaseEntity: 'none',
        convertCaseFile: 'none',
        convertCaseProperty: 'none',
        propertyVisibility: 'none',
        lazy: false,
        generateConstructor: false,
        customNamingStrategyPath: "",
        relationIds: false,
        activeRecord: false
    };
}
exports.getGenerationOptions = getGenerationOptions;
function createMSSQLModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new MssqlDriver_1.MssqlDriver();
        const connectionOptions = {
            host: String(process.env.MSSQL_Host),
            port: Number(process.env.MSSQL_Port),
            databaseName: `master`,
            user: String(process.env.MSSQL_Username),
            password: String(process.env.MSSQL_Password),
            databaseType: 'mssql',
            schemaName: 'dbo,sch1,sch2',
            ssl: yn(process.env.MSSQL_SSL),
        };
        yield driver.ConnectToServer(connectionOptions);
        connectionOptions.databaseName = String(process.env.MSSQL_Database);
        if (yield driver.CheckIfDBExists(String(process.env.MSSQL_Database))) {
            yield driver.DropDB(String(process.env.MSSQL_Database));
        }
        yield driver.CreateDB(String(process.env.MSSQL_Database));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.MSSQL_Database),
            host: String(process.env.MSSQL_Host),
            password: String(process.env.MSSQL_Password),
            type: 'mssql',
            username: String(process.env.MSSQL_Username),
            port: Number(process.env.MSSQL_Port),
            dropSchema: true,
            synchronize: false,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'mssql'
        };
        const schemas = 'dbo,sch1,sch2';
        let conn = yield typeorm_1.createConnection(connOpt);
        let queryRunner = conn.createQueryRunner();
        for (const sch of schemas.split(',')) {
            yield queryRunner.createSchema(sch, true);
        }
        yield conn.synchronize();
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createMSSQLModels = createMSSQLModels;
function createPostgresModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new PostgresDriver_1.PostgresDriver();
        const connectionOptions = {
            host: String(process.env.POSTGRES_Host),
            port: Number(process.env.POSTGRES_Port),
            databaseName: `postgres`,
            user: String(process.env.POSTGRES_Username),
            password: String(process.env.POSTGRES_Password),
            databaseType: 'postgres',
            schemaName: 'public,sch1,sch2',
            ssl: yn(process.env.POSTGRES_SSL),
        };
        yield driver.ConnectToServer(connectionOptions);
        connectionOptions.databaseName = String(process.env.POSTGRES_Database);
        if (yield driver.CheckIfDBExists(String(process.env.POSTGRES_Database))) {
            yield driver.DropDB(String(process.env.POSTGRES_Database));
        }
        yield driver.CreateDB(String(process.env.POSTGRES_Database));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.POSTGRES_Database),
            host: String(process.env.POSTGRES_Host),
            password: String(process.env.POSTGRES_Password),
            type: 'postgres',
            username: String(process.env.POSTGRES_Username),
            port: Number(process.env.POSTGRES_Port),
            dropSchema: true,
            synchronize: false,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'postgres'
        };
        const schemas = 'public,sch1,sch2';
        let conn = yield typeorm_1.createConnection(connOpt);
        let queryRunner = conn.createQueryRunner();
        for (const sch of schemas.split(',')) {
            yield queryRunner.createSchema(sch, true);
        }
        yield conn.synchronize();
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createPostgresModels = createPostgresModels;
function createSQLiteModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new SqliteDriver_1.SqliteDriver();
        const connectionOptions = {
            host: '',
            port: 0,
            databaseName: String(process.env.SQLITE_Database),
            user: '',
            password: '',
            databaseType: 'sqlite',
            schemaName: '',
            ssl: false,
        };
        yield driver.ConnectToServer(connectionOptions);
        if (yield driver.CheckIfDBExists(String(process.env.SQLITE_Database))) {
            yield driver.DropDB(String(process.env.SQLITE_Database));
        }
        yield driver.CreateDB(String(process.env.SQLITE_Database));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.SQLITE_Database),
            type: 'sqlite',
            dropSchema: true,
            synchronize: false,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'sqlite'
        };
        let conn = yield typeorm_1.createConnection(connOpt);
        yield conn.synchronize();
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createSQLiteModels = createSQLiteModels;
function createMysqlModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new MysqlDriver_1.MysqlDriver();
        const connectionOptions = {
            host: String(process.env.MYSQL_Host),
            port: Number(process.env.MYSQL_Port),
            databaseName: String(process.env.MYSQL_Database),
            user: String(process.env.MYSQL_Username),
            password: String(process.env.MYSQL_Password),
            databaseType: 'mysql',
            schemaName: 'ignored',
            ssl: yn(process.env.MYSQL_SSL),
        };
        yield driver.ConnectToServer(connectionOptions);
        if (yield driver.CheckIfDBExists(String(process.env.MYSQL_Database))) {
            yield driver.DropDB(String(process.env.MYSQL_Database));
        }
        yield driver.CreateDB(String(process.env.MYSQL_Database));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.MYSQL_Database),
            host: String(process.env.MYSQL_Host),
            password: String(process.env.MYSQL_Password),
            type: 'mysql',
            username: String(process.env.MYSQL_Username),
            port: Number(process.env.MYSQL_Port),
            dropSchema: true,
            synchronize: true,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'mysql'
        };
        const conn = yield typeorm_1.createConnection(connOpt);
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createMysqlModels = createMysqlModels;
function createMariaDBModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new MariaDbDriver_1.MariaDbDriver();
        const connectionOptions = {
            host: String(process.env.MARIADB_Host),
            port: Number(process.env.MARIADB_Port),
            databaseName: String(process.env.MARIADB_Database),
            user: String(process.env.MARIADB_Username),
            password: String(process.env.MARIADB_Password),
            databaseType: 'mariadb',
            schemaName: 'ignored',
            ssl: yn(process.env.MARIADB_SSL),
        };
        yield driver.ConnectToServer(connectionOptions);
        if (yield driver.CheckIfDBExists(String(process.env.MARIADB_Database))) {
            yield driver.DropDB(String(process.env.MARIADB_Database));
        }
        yield driver.CreateDB(String(process.env.MARIADB_Database));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.MARIADB_Database),
            host: String(process.env.MARIADB_Host),
            password: String(process.env.MARIADB_Password),
            type: 'mariadb',
            username: String(process.env.MARIADB_Username),
            port: Number(process.env.MARIADB_Port),
            dropSchema: true,
            synchronize: true,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'mariadb'
        };
        const conn = yield typeorm_1.createConnection(connOpt);
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createMariaDBModels = createMariaDBModels;
function createOracleDBModels(filesOrgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        driver = new OracleDriver_1.OracleDriver();
        const connectionOptions = {
            host: String(process.env.ORACLE_Host),
            port: Number(process.env.ORACLE_Port),
            databaseName: String(process.env.ORACLE_Database),
            user: String(process.env.ORACLE_UsernameSys),
            password: String(process.env.ORACLE_PasswordSys),
            databaseType: 'oracle',
            schemaName: String(process.env.ORACLE_Username),
            ssl: yn(process.env.ORACLE_SSL),
        };
        yield driver.ConnectToServer(connectionOptions);
        connectionOptions.user = String(process.env.ORACLE_Username);
        connectionOptions.password = String(process.env.ORACLE_Password);
        if (yield driver.CheckIfDBExists(String(process.env.ORACLE_Username))) {
            yield driver.DropDB(String(process.env.ORACLE_Username));
        }
        yield driver.CreateDB(String(process.env.ORACLE_Username));
        yield driver.DisconnectFromServer();
        const connOpt = {
            database: String(process.env.ORACLE_Database),
            sid: String(process.env.ORACLE_Database),
            host: String(process.env.ORACLE_Host),
            password: String(process.env.ORACLE_Password),
            type: 'oracle',
            username: String(process.env.ORACLE_Username),
            port: Number(process.env.ORACLE_Port),
            synchronize: true,
            entities: [path.resolve(filesOrgPath, '*.js')],
            name: 'oracle',
        };
        const conn = yield typeorm_1.createConnection(connOpt);
        if (conn.isConnected) {
            yield conn.close();
        }
        return connectionOptions;
    });
}
exports.createOracleDBModels = createOracleDBModels;
function compileTsFiles(fileNames, options) {
    const program = ts.createProgram(fileNames, options);
    const emitResult = program.emit();
    let compileErrors = false;
    const preDiagnostics = ts.getPreEmitDiagnostics(program);
    const allDiagnostics = [...preDiagnostics, ...emitResult.diagnostics];
    allDiagnostics.forEach(diagnostic => {
        const lineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${lineAndCharacter.line + 1},${lineAndCharacter.character + 1}): ${message}`);
        compileErrors = true;
    });
    return compileErrors;
}
exports.compileTsFiles = compileTsFiles;
function getEnabledDbDrivers() {
    const dbDrivers = [];
    if (process.env.SQLITE_Skip == '0') {
        dbDrivers.push('sqlite');
    }
    if (process.env.POSTGRES_Skip == '0') {
        dbDrivers.push('postgres');
    }
    if (process.env.MYSQL_Skip == '0') {
        dbDrivers.push('mysql');
    }
    if (process.env.MARIADB_Skip == '0') {
        dbDrivers.push('mariadb');
    }
    if (process.env.MSSQL_Skip == '0') {
        dbDrivers.push('mssql');
    }
    if (process.env.ORACLE_Skip == '0') {
        dbDrivers.push('oracle');
    }
    return dbDrivers;
}
exports.getEnabledDbDrivers = getEnabledDbDrivers;
function createModelsInDb(dbDriver, filesOrgPathJS) {
    switch (dbDriver) {
        case 'sqlite':
            return createSQLiteModels(filesOrgPathJS);
        case 'postgres':
            return createPostgresModels(filesOrgPathJS);
        case 'mysql':
            return createMysqlModels(filesOrgPathJS);
        case 'mariadb':
            return createMariaDBModels(filesOrgPathJS);
        case 'mssql':
            return createMSSQLModels(filesOrgPathJS);
        case 'oracle':
            return createOracleDBModels(filesOrgPathJS);
        default:
            console.log(`Unknown engine type`);
            throw new Error("Unknown engine type");
    }
}
exports.createModelsInDb = createModelsInDb;
//# sourceMappingURL=GeneralTestUtils.js.map