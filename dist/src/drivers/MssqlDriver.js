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
const MSSQL = require("mssql");
const TypeormDriver = require("typeorm/driver/sqlserver/SqlServerDriver");
const ColumnInfo_1 = require("../models/ColumnInfo");
const TomgUtils = require("../Utils");
const AbstractDriver_1 = require("./AbstractDriver");
class MssqlDriver extends AbstractDriver_1.AbstractDriver {
    constructor() {
        super(...arguments);
        this.defaultValues = new TypeormDriver.SqlServerDriver({
            options: { replication: undefined }
        }).dataTypeDefaults;
        this.standardPort = 1433;
        this.standardSchema = "dbo";
        this.standardUser = "sa";
        this.GetAllTablesQuery = (schema, dbNames) => __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            const response = (yield request.query(`SELECT TABLE_SCHEMA,TABLE_NAME, table_catalog as "DB_NAME" FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE='BASE TABLE' and TABLE_SCHEMA in (${schema}) AND TABLE_CATALOG in (${this.escapeCommaSeparatedList(dbNames)})`)).recordset;
            return response;
        });
    }
    GetCoulmnsFromEntity(entities, schema, dbNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            const response = (yield request.query(`SELECT TABLE_NAME,COLUMN_NAME,COLUMN_DEFAULT,IS_NULLABLE,
   DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,NUMERIC_SCALE,
   COLUMNPROPERTY(object_id(TABLE_NAME), COLUMN_NAME, 'IsIdentity') IsIdentity,
   (SELECT count(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        inner join INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE cu
            on cu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
    where
        tc.CONSTRAINT_TYPE = 'UNIQUE'
        and tc.TABLE_NAME = c.TABLE_NAME
        and cu.COLUMN_NAME = c.COLUMN_NAME
        and tc.TABLE_SCHEMA=c.TABLE_SCHEMA) IsUnique
   FROM INFORMATION_SCHEMA.COLUMNS c
   where TABLE_SCHEMA in (${schema}) AND TABLE_CATALOG in (${this.escapeCommaSeparatedList(dbNames)})
        order by ordinal_position`)).recordset;
            entities.forEach(ent => {
                response
                    .filter(filterVal => {
                    return filterVal.TABLE_NAME === ent.tsEntityName;
                })
                    .forEach(resp => {
                    const colInfo = new ColumnInfo_1.ColumnInfo();
                    colInfo.tsName = resp.COLUMN_NAME;
                    colInfo.options.name = resp.COLUMN_NAME;
                    colInfo.options.nullable = resp.IS_NULLABLE === "YES";
                    colInfo.options.generated = resp.IsIdentity === 1;
                    colInfo.options.unique = resp.IsUnique === 1;
                    colInfo.options.default = this.ReturnDefaultValueFunction(resp.COLUMN_DEFAULT);
                    colInfo.options.type = resp.DATA_TYPE;
                    switch (resp.DATA_TYPE) {
                        case "bigint":
                            colInfo.tsType = "string";
                            break;
                        case "bit":
                            colInfo.tsType = "boolean";
                            break;
                        case "decimal":
                            colInfo.tsType = "number";
                            break;
                        case "int":
                            colInfo.tsType = "number";
                            break;
                        case "money":
                            colInfo.tsType = "number";
                            break;
                        case "numeric":
                            colInfo.tsType = "number";
                            break;
                        case "smallint":
                            colInfo.tsType = "number";
                            break;
                        case "smallmoney":
                            colInfo.tsType = "number";
                            break;
                        case "tinyint":
                            colInfo.tsType = "number";
                            break;
                        case "float":
                            colInfo.tsType = "number";
                            break;
                        case "real":
                            colInfo.tsType = "number";
                            break;
                        case "date":
                            colInfo.tsType = "Date";
                            break;
                        case "datetime2":
                            colInfo.tsType = "Date";
                            break;
                        case "datetime":
                            colInfo.tsType = "Date";
                            break;
                        case "datetimeoffset":
                            colInfo.tsType = "Date";
                            break;
                        case "smalldatetime":
                            colInfo.tsType = "Date";
                            break;
                        case "time":
                            colInfo.tsType = "Date";
                            break;
                        case "char":
                            colInfo.tsType = "string";
                            break;
                        case "text":
                            colInfo.tsType = "string";
                            break;
                        case "varchar":
                            colInfo.tsType = "string";
                            break;
                        case "nchar":
                            colInfo.tsType = "string";
                            break;
                        case "ntext":
                            colInfo.tsType = "string";
                            break;
                        case "nvarchar":
                            colInfo.tsType = "string";
                            break;
                        case "binary":
                            colInfo.tsType = "Buffer";
                            break;
                        case "image":
                            colInfo.tsType = "Buffer";
                            break;
                        case "varbinary":
                            colInfo.tsType = "Buffer";
                            break;
                        case "hierarchyid":
                            colInfo.tsType = "string";
                            break;
                        case "sql_variant":
                            colInfo.tsType = "string";
                            break;
                        case "timestamp":
                            colInfo.tsType = "Date";
                            break;
                        case "uniqueidentifier":
                            colInfo.tsType = "string";
                            break;
                        case "xml":
                            colInfo.tsType = "string";
                            break;
                        case "geometry":
                            colInfo.tsType = "string";
                            break;
                        case "geography":
                            colInfo.tsType = "string";
                            break;
                        default:
                            TomgUtils.LogError(`Unknown column type: ${resp.DATA_TYPE}  table name: ${resp.TABLE_NAME} column name: ${resp.COLUMN_NAME}`);
                            break;
                    }
                    if (this.ColumnTypesWithPrecision.some(v => v === colInfo.options.type)) {
                        colInfo.options.precision = resp.NUMERIC_PRECISION;
                        colInfo.options.scale = resp.NUMERIC_SCALE;
                    }
                    if (this.ColumnTypesWithLength.some(v => v === colInfo.options.type)) {
                        colInfo.options.length =
                            resp.CHARACTER_MAXIMUM_LENGTH > 0
                                ? resp.CHARACTER_MAXIMUM_LENGTH
                                : undefined;
                    }
                    if (colInfo.options.type) {
                        ent.Columns.push(colInfo);
                    }
                });
            });
            return entities;
        });
    }
    GetIndexesFromEntity(entities, schema, dbNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            const response = [];
            for (const dbName of dbNames.split(",")) {
                yield this.UseDB(dbName);
                const resp = (yield request.query(`SELECT
         TableName = t.name,
         IndexName = ind.name,
         ColumnName = col.name,
         ind.is_unique,
         ind.is_primary_key
    FROM
         sys.indexes ind
    INNER JOIN
         sys.index_columns ic ON  ind.object_id = ic.object_id and ind.index_id = ic.index_id
    INNER JOIN
         sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id
    INNER JOIN
         sys.tables t ON ind.object_id = t.object_id
    INNER JOIN
         sys.schemas s on s.schema_id=t.schema_id
    WHERE
         t.is_ms_shipped = 0 and s.name in (${schema})
    ORDER BY
         t.name, ind.name, ind.index_id, ic.key_ordinal;`)).recordset;
                response.push(...resp);
            }
            entities.forEach(ent => {
                response
                    .filter(filterVal => filterVal.TableName === ent.tsEntityName)
                    .forEach(resp => {
                    let indexInfo = {};
                    const indexColumnInfo = {};
                    if (ent.Indexes.filter(filterVal => {
                        return filterVal.name === resp.IndexName;
                    }).length > 0) {
                        indexInfo = ent.Indexes.filter(filterVal => {
                            return filterVal.name === resp.IndexName;
                        })[0];
                    }
                    else {
                        indexInfo.columns = [];
                        indexInfo.name = resp.IndexName;
                        indexInfo.isUnique = resp.is_unique;
                        indexInfo.isPrimaryKey = resp.is_primary_key;
                        ent.Indexes.push(indexInfo);
                    }
                    indexColumnInfo.name = resp.ColumnName;
                    indexInfo.columns.push(indexColumnInfo);
                });
            });
            return entities;
        });
    }
    GetRelations(entities, schema, dbNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            const response = [];
            for (const dbName of dbNames.split(",")) {
                yield this.UseDB(dbName);
                const resp = (yield request.query(`select
    parentTable.name as TableWithForeignKey,
    fkc.constraint_column_id as FK_PartNo,
     parentColumn.name as ForeignKeyColumn,
     referencedTable.name as TableReferenced,
     referencedColumn.name as ForeignKeyColumnReferenced,
     fk.delete_referential_action_desc as onDelete,
     fk.update_referential_action_desc as onUpdate,
     fk.object_id
from
    sys.foreign_keys fk
inner join
    sys.foreign_key_columns as fkc on fkc.constraint_object_id=fk.object_id
inner join
    sys.tables as parentTable on fkc.parent_object_id = parentTable.object_id
inner join
    sys.columns as parentColumn on fkc.parent_object_id = parentColumn.object_id and fkc.parent_column_id = parentColumn.column_id
inner join
    sys.tables as referencedTable on fkc.referenced_object_id = referencedTable.object_id
inner join
    sys.columns as referencedColumn on fkc.referenced_object_id = referencedColumn.object_id and fkc.referenced_column_id = referencedColumn.column_id
inner join
	sys.schemas as parentSchema on parentSchema.schema_id=parentTable.schema_id
where
    fk.is_disabled=0 and fk.is_ms_shipped=0 and parentSchema.name in (${schema})
order by
    TableWithForeignKey, FK_PartNo`)).recordset;
                response.push(...resp);
            }
            const relationsTemp = [];
            response.forEach(resp => {
                let rels = relationsTemp.find(val => val.object_id === resp.object_id);
                if (rels === undefined) {
                    rels = {};
                    rels.ownerColumnsNames = [];
                    rels.referencedColumnsNames = [];
                    switch (resp.onDelete) {
                        case "NO_ACTION":
                            rels.actionOnDelete = null;
                            break;
                        case "SET_NULL":
                            rels.actionOnDelete = "SET NULL";
                            break;
                        default:
                            rels.actionOnDelete = resp.onDelete;
                            break;
                    }
                    switch (resp.onUpdate) {
                        case "NO_ACTION":
                            rels.actionOnUpdate = null;
                            break;
                        case "SET_NULL":
                            rels.actionOnUpdate = "SET NULL";
                            break;
                        default:
                            rels.actionOnUpdate = resp.onUpdate;
                            break;
                    }
                    rels.object_id = resp.object_id;
                    rels.ownerTable = resp.TableWithForeignKey;
                    rels.referencedTable = resp.TableReferenced;
                    relationsTemp.push(rels);
                }
                rels.ownerColumnsNames.push(resp.ForeignKeyColumn);
                rels.referencedColumnsNames.push(resp.ForeignKeyColumnReferenced);
            });
            entities = this.GetRelationsFromRelationTempInfo(relationsTemp, entities);
            return entities;
        });
    }
    DisconnectFromServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.Connection) {
                yield this.Connection.close();
            }
        });
    }
    ConnectToServer(connectionOptons) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseName = connectionOptons.databaseName.split(",")[0];
            const config = {
                database: databaseName,
                options: {
                    appName: "typeorm-model-generator",
                    encrypt: connectionOptons.ssl
                },
                password: connectionOptons.password,
                port: connectionOptons.port,
                server: connectionOptons.host,
                user: connectionOptons.user
            };
            const promise = new Promise((resolve, reject) => {
                this.Connection = new MSSQL.ConnectionPool(config, err => {
                    if (!err) {
                        resolve(true);
                    }
                    else {
                        TomgUtils.LogError("Error connecting to MSSQL Server.", false, err.message);
                        reject(err);
                    }
                });
            });
            yield promise;
        });
    }
    CreateDB(dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            yield request.query(`CREATE DATABASE ${dbName}; `);
        });
    }
    UseDB(dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            yield request.query(`USE ${dbName}; `);
        });
    }
    DropDB(dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            yield request.query(`DROP DATABASE ${dbName}; `);
        });
    }
    CheckIfDBExists(dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MSSQL.Request(this.Connection);
            const resp = yield request.query(`SELECT name FROM master.sys.databases WHERE name = N'${dbName}' `);
            return resp.recordset.length > 0;
        });
    }
    ReturnDefaultValueFunction(defVal) {
        if (!defVal) {
            return null;
        }
        if (defVal.startsWith("(") && defVal.endsWith(")")) {
            defVal = defVal.slice(1, -1);
        }
        if (defVal.startsWith(`'`)) {
            return `() => "${defVal}"`;
        }
        return `() => "${defVal}"`;
    }
}
exports.MssqlDriver = MssqlDriver;
//# sourceMappingURL=MssqlDriver.js.map