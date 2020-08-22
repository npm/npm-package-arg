export type ResType = "file" | "directory" | "git" | "remote" | "version" | "range" | "tag" | "alias";

export interface HostedGit {
  type: string;
  domain: string;
  user: string;
  project: string;
}

export interface ResultOpts {
    type: ResType;
    registry: boolean;
    where: string;
    raw: string;
    name?: string;
    rawSpec: string;
    saveSpec?: string;
    fetchSpec?: string;
    gitRange?: string;
    gitCommittish?: string;
    hosted?: HostedGit;
};
/**
 * main export
 * @param {string | Result} arg - a string that you might pass to npm install or
 * an instance of Result
 * @param {string} [where] Optionally the source dir to resolve relative paths
 * from, Defaults to process.cwd()
 * @returns {Result} instance of `Result`
 * @throws if the package name is invalid, a dist-tag is invalid or a URL's
 * protocol is not supported.
 * @example //example string-values to pass to `arg`
 * `foo@1.2`
 * `@bar/foo@1.2`
 * `foo@user/foo`
 * `http://x.com/foo.tgz`
 * `git+https://github.com/user/foo`
 * `bitbucket:user/foo`
 * `foo.tar.gz`
 * `../foo/bar/ or bar`
 */
export function npa(arg: string | Result, where?: string): Result;


/**
 * @param {string} [name] - The name of the module you may want to install.
 * @param {string} [spec] - The specifier indicating where and how you can get
 * this module. If omitted defaults to `latest`
 * @param {string} [where] Optionally the source dir to resolve relative paths
 * from, Defaults to process.cwd()
 * @param {string} [arg] - given internally when `resolve` is called by `npa`.
 * its value is that of what was passed to npa. It's assigned straight to the
 * Result constructor and doesn't really fo anything
 * @returns {Result} instance of `Result`
 * @throws if the package name is invalid, a dist-tag is invalid or a URL's
 * protocol is not supported.
 * @example //example string-values to pass to `spec`
 * `1.2`
 * `^1.7.17`
 * `http://x.com/foo.tgz`
 * `git+https://github.com/user/foo`
 * `bitbucket:user/foo`
 * `file:foo.tar.gz`
 * `file:../foo/bar/`
 */
export function resolve(name?: string, spec?: string, where?: string, arg?: string):
FileResult |
HostedGitResult |
URLResult |
AliasResult |
RegistryResult;;

export class Result {
    constructor(opts: ResultOpts);

    /**
     * One of the following strings:
     * * git - A git repo
     * * tag - A tagged version, like "foo@latest"
     * * version - A specific version number, like "foo@1.2.3"
     * * range - A version range, like "foo@2.x"
     * * file - A local .tar.gz, .tar or .tgz file.
     * * directory - A local directory.
     * * remote - An http url (presumably to a tgz)
     */
    type: "file" | "directory" | "git" | "remote" | "version" | "range" | "tag" | "alias";

    /**
     * If true this specifier refers to a resource hosted on a registry. This is
     * true for tag, version and range types.
     */
    registry: boolean;
    /** the path where it was resolved from */
    where: string;
    /**
     * The original un-modified string that was provided. If called as
     * npa.resolve(name, spec) then this will be name + '@' + spec.
     */
    raw: string;

    /** If known, the name field expected in the resulting pkg. */
    name: string | undefined;
     /**
      * A version of name escaped to match the npm scoped packages
      * specification. Mostly used when making requests against a registry. When
      * name is undefined, escapedName will also be undefined.
      */
    escapedName: string | undefined;
    /**
     * If a name is something like @org/module then the scope field will be set
     * to @org. If it doesn't have a scoped name, then scope is undefined.
     */
    scope: string | undefined;
    /**
     * The specifier part that was parsed out in calls to npa(arg), or the value
     * of spec in calls to `npa.resolve(name, spec).
     */
    rawSpec: string;
    /**
     * The normalized specifier, for saving to package.json files. null for
     * registry dependencies.
     */
    saveSpec: string | null;
    /**
     * The version of the specifier to be used to fetch this resource. null for
     * shortcuts to hosted git dependencies as there isn't just one URL to try
     * with them.
     */
    fetchSpec: string | null;
    /** If set, this is a semver specifier to match against git tags with */
    gitRange: string;
    /** If set, this is the specific committish to use with a git dependency. */
    gitCommittish: string | null;
    /**
     * If from === 'hosted' then this will be a hosted-git-info object.
     * This property is not included when serializing the object as JSON.
     */
    hosted: HostedGit;
    setName(name: string): Result;
    toString(): string;
    toJSON(): Result;
}

export interface FileResult extends Result {
  type: "file" | "directory";
  where: string;
  saveSpec: string;
  fetchSpec: null | string;
}

export interface HostedGitResult extends Result {
  type: "git";
  hosted: HostedGit;
  saveSpec: string;
  fetchSpec: null | string;
  gitRange: undefined | string;
  gitCommittish: undefined | string;
}

export interface URLResult extends Result {
  saveSpec: string;
  type: "git" | "remote";
  fetchSpec: string;
  gitCommittish: string | undefined;
  gitRange: string | undefined;
}

export interface AliasResult extends Result {
  subSpec: Result;
  registry: true;
  type: "alias";
  saveSpec: null;
  fetchSpec: null;
}

export interface RegistryResult extends Result {
  registry: true;
  type: "version" | "range" | "tag";
  saveSpec: null;
  fetchSpec: string;
}

interface HostedGit {
  type: string;
  domain: string;
  user: string;
  project: string;
}
