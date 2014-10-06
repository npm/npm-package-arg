var npa = require("../npa.js")
var path = require("path")

require("tap").test("basic", function (t) {
  t.setMaxListeners(999)

  var tests = {
    "user/foo-js": {
      name: null,
      type: "github",
      spec: "user/foo-js",
      raw: "user/foo-js"
    },

    "user/foo-js#bar/baz": {
      name: null,
      type: "github",
      spec: "user/foo-js#bar/baz",
      raw: "user/foo-js#bar/baz"
    },

    "user..blerg--/..foo-js# . . . . . some . tags / / /": {
      name: null,
      type: "github",
      spec: "user..blerg--/..foo-js# . . . . . some . tags / / /",
      raw: "user..blerg--/..foo-js# . . . . . some . tags / / /"
    },

    "user/foo-js#bar/baz/bin": {
      name: null,
      type: "github",
      spec: "user/foo-js#bar/baz/bin",
      raw: "user/foo-js#bar/baz/bin"
    },

    "foo@user/foo-js": {
      name: "foo",
      type: "github",
      spec: "user/foo-js",
      raw: "foo@user/foo-js"
    },

    "git+ssh://git@github.com/user/foo#1.2.3": {
      name: null,
      type: "git",
      spec: "ssh://git@github.com/user/foo#1.2.3",
      raw: "git+ssh://git@github.com/user/foo#1.2.3"
    },

    "git://github.com/user/foo": {
      name: null,
      type: "git",
      spec: "git://github.com/user/foo",
      raw: "git://github.com/user/foo"
    },

    "@foo/bar@git+ssh://github.com/user/foo": {
      name: "@foo/bar",
      scope: "@foo",
      spec: "ssh://github.com/user/foo",
      rawSpec: "git+ssh://github.com/user/foo",
      raw: "@foo/bar@git+ssh://github.com/user/foo"
    },

  }

  Object.keys(tests).forEach(function (arg) {
    var res = npa(arg)
    t.type(res, "Result")
    t.has(res, tests[arg])
  })

  t.end()
})
