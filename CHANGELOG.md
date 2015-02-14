<a name="0.1.1"></a>
### 0.1.1 (2015-02-14)

* Fix problem with linking that mutated existing nodes without going through VNode constructor, causing the diff algorithm to get confused in some situations.

<a name="0.1.0"></a>
### 0.1.0 (2015-02-09)

* Support directive priorities. Higher priority wins, same as in $compile. Ties are broken first by name, then by registration order.
