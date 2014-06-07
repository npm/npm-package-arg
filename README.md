# npm-package-arg

Parse the things that can be arguments to `npm install`

Takes an argument like `foo@1.2`, or `foo@user/foo`, or
`http://x.com/foo.tgz`, or `git+https://github.com/user/foo`, and
figures out what type of thing it is.

## USAGE

```javascript
var assert = require("assert")
var npa = require("npm-package-arg")

// Pass in the descriptor, and it'll return an object
// Here are several examples

assert.deepEqual(npa("foo@1.2"), {
  name: "foo",  // The bit in front of the @
  type: "range", // the type of descriptor this is
  spec: "1.2" // the specifier for this descriptor
})

// If it doesn't have a "name@" in front, then the name
// field will be empty.  This is ok for URLs and files only.

assert.deepEqual(npa("git://github.com/user/foo"), {
  name: null,
  type: "git",
  spec: "git://github.com/user/foo"
})

// Note that "local" can be either a tgz, or a folder.
// It's impossible to know for sure without doing some IO
assert.deepEqual(npa("/path/to/foo"), {
  name: null,
  type: "local",
  spec: "/path/to/foo"
})

assert.deepEqual(npa("https://server.com/foo.tgz"), {
  name: null,
  type: "remote",
  spec: "https://server.com/foo.tgz"
})

// user/project shorthand for github git urls
assert.deepEqual(npa("user/foo-js"), {
  name: null,
  type: "git",
  spec: "git+https://github.com/user/foo-js",
  raw: "user/foo-js"
})

// You can always do a "name@" in front of anything
assert.deepEqual(npa("foo@user/foo-js"), {
  name: "foo",
  type: "git",
  spec: "git+https://github.com/user/foo-js"
})

assert.deepEqual(npa("foo@latest"), {
  name: "foo",
  type: "tag",
  spec: "latest"
})

// If there's no @, then treat as a lone name with the "" range
assert.deepEqual(npa("foo"), {
  name: "foo",
  type: "range",
  spec: ""
})

// Completely unreasonable invalid garbage throws an error
assert.throws(function() {
  npa("this is not a valid package name or url")
})
```

## Result Objects

The objects that are returned by npm-package-arg contain the following
fields:

* `name` - If known, the `name` field expected in the resulting pkg.
* `type` - One of the following strings:
  * `git` - A git repo
  * `tag` - A tagged version, like `"foo@latest"`
  * `version` - A specific version number, like `"foo@1.2.3"`
  * `range` - A version range, like `"foo@2.x"`
  * `local` - A local file or folder path
  * `remote` - An http url (presumably to a tgz)
* `spec` - The "thing".  URL, the range, git repo, etc.
* `raw` - If the spec is changed in any way (eg, if a `user/foo`
  github shorthand is expanded to a full git url or `v1.2.3` is
  cleaned up to just `1.2.3`) then this is the original un-modified
  string that was provided.
