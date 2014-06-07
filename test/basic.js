var npa = require("./")

require("tap").test("basic", function (t) {

  // Pass in the descriptor, and it'll return an object
  // Here are several examples

  t.deepEqual(npa("foo@1.2"), {
    name: "foo",  // The bit in front of the @
    type: "range", // the type of descriptor this is
    spec: "1.2" // the specifier for this descriptor
  })

  // If it doesn't have a "name@" in front, then the name
  // field will be empty.  This is ok for URLs and files only.

  t.deepEqual(npa("git://github.com/user/foo"), {
    name: null,
    type: "git",
    spec: "git://github.com/user/foo"
  })

  // Note that "local" can be either a tgz, or a folder.
  // It's impossible to know for sure without doing some IO
  t.deepEqual(npa("/path/to/foo"), {
    name: null,
    type: "local",
    spec: "/path/to/foo"
  })

  t.deepEqual(npa("https://server.com/foo.tgz"), {
    name: null,
    type: "remote",
    spec: "https://server.com/foo.tgz"
  })

  // user/project shorthand for github git urls
  t.deepEqual(npa("user/foo-js"), {
    name: null,
    type: "git",
    spec: "git+https://github.com/user/foo-js",
    raw: "user/foo-js"
  })

  // You can always do a "name@" in front of anything
  t.deepEqual(npa("foo@user/foo-js"), {
    name: "foo",
    type: "git",
    spec: "git+https://github.com/user/foo-js"
  })

  t.deepEqual(npa("foo@latest"), {
    name: "foo",
    type: "tag",
    spec: "latest"
  })

  // If there's no @, then treat as a lone name with the "" range
  t.deepEqual(npa("foo"), {
    name: "foo",
    type: "range",
    spec: ""
  })

  // Completely unreasonable invalid garbage throws an error
  t.throws(function() {
    npa("this is not a valid package name or url")
  })

  t.end()
})
