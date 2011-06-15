/*
---
name: Accessible Tree

description: demo application

License: MIT

Version: 1.0

authors:
	- Christian Merz
	- Christoph Pojer
Dependencies:
	- Core/1.2.3: *
	- More/1.2.4.1: Drag 
	- More/1.2.4.1: Drag.Move
	- More/1.2.4.1: Element.Delegation

provides: Tree
...
*/
window.addEvent('domready', function(){

    new Tree('tree');
});
