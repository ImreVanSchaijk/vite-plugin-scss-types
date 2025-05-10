import { JSONSchema } from "json-schema-to-typescript";
import PostcssModulesPlugin from "postcss-modules";

type LocalsConvention = Parameters<
  typeof PostcssModulesPlugin
>[0]["localsConvention"];

export interface ScssTypesPluginOptions {
  /** The banner to add to the top of the generated file. Default: `"// This file is generated automatically do not modify it by hand"`  */
  banner: string;
  /** The glob pattern to search for scss files. Default: `src/ ** /*.module.scss` */
  fileGlob: string;
  /** Whether or not to run on startup. Default: `true` */
  initialize: boolean;
  /** Whether or not to allow generation for non-module files. Default: `true` */
  modulesOnly: boolean;
  /** The name of the generated interface. Default: `"Styles"` */
  name: string;
  /** Whether or not to remove orphaned files. Default: `true` */
  removeOrphans: boolean;
  /** The locals convention to use. Default: `"camelCaseOnly"` */
  localsConvention: LocalsConvention;
  /** Allow additional properties. Default: `false` */
  additionalProperties: JSONSchema["additionalProperties"];
  /** The name of the export. Default: `"styles"` */
  exportName?: string | string[];
}
