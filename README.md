README


#PROJECT STRUCTURE


#JS BEST PRACTICES

Use "use strict"; at the beginning of a module/parent function. This would help to identify errors asap.

Do not use anonymous functions, always put a name: This make debugging easier.


#ANGULAR JS BEST PRACTICES

##Controllers

Avoid using "$scope" as much as you can.

Create a variable "self" where "this" would be stored.
Declare functions by name, not stored on a var
	
	"function myName()" instead of "var myName = function(){ }"

	If you need to access to scope on a function do the following:  self.property;

Do not declare functions directly on "$scope" or "self", do it at the end of the controller
	
	_.extend(self, { myName : myName });

If you need to setup $watchers or any event when controller starts, wrap that on a function "init" and called it at the end of the controller.


##DIRECTIVES

Use "controllerAs" instead of controller: This would give us a clear understanding of where is the binding coming from.

Use "track by" on ng-repeat, this make data-binding tracking and rendering faster on collections

On templates use "one time binding" on properties we think will not change on the future. Notation {{::property}}

