# To-Do

- [ ] Make this README.md :)
- [x] Trigger `onRefresh` event when iscroll is internally refreshed (e.g. on window resize)
- [x] Do not `require('iscroll')` by itself. Instead pass it in props (there is few different versions of iscroll and you want to pick correct one for you)
- [ ] Add tests
- [ ] Think about `shouldComponentUpdate`. Now it is always true because `this.props.children` are new object everytime and can't be compared via `==` or `===`. Maybe there is some way how to cheaply compare them.

# Licence

Reditor is released under the [MIT License](http://www.opensource.org/licenses/MIT).
