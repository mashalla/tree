/*
---
name: Accessible Tree

description: accessible tree

license: MIT

version: 1.0

authors:
 - Christian Merz
 - Christoph Pojer

requires:
 - Core/1.2.3: *
 - More/1.2.4.1: Drag 
 - More/1.2.4.1: Drag.Move
 - More/1.2.4.1: Element.Delegation

provides: [Tree]

...
*/



(function(){

    this.Tree = new Class({
    
        Implements: [Options],
        
        options: {
            animate: true,
            fadeOpacity: 1,
            selector: 'img.expand',
            listSelector: 'li',
            childSelector: 'ul',
            textSelector: 'span'
        },
        
        initialize: function(element, options){
            this.singleton = true;
            this.setOptions(options);
            this.element = document.id(element);
            this.treeitems = new Array();
            var tmp = this.element.getElements(this.options.textSelector);
            for (var i = 0; i < tmp.length; i++) {
                this.treeitems[i] = new Array();
                this.treeitems[i][0] = tmp[i]; //item
                this.treeitems[i][1] = true; //visible
                this.treeitems[i][2] = true; //expandend
                this.treeitems[i][3] = (tmp[i].getProperty('html').substr(0, 1)).toUpperCase(); //firstLetter                
                this.treeitems[i][4] = false; //selected    
            }
            var self = this;
            //IOS cant read images inside the role tree
            if (Browser.Platform.name != "ios") 
                this.element.setProperty('role', 'tree');
            this.element.getElements(self.options.childSelector).each(function(el){
                el.setProperty('role', 'group');
                var dlidiv = new Element('div', {
                    'class': 'lineDiv'
                }).inject(el, 'top');
                var dli = new Element('div', {
                    'class': 'lineV'
                }).inject(dlidiv);
            });
            this.element.getElements(self.options.listSelector).each(function(el){
                var imgex = new Element('img', {
                    'class': 'expand',
                    'src': "img/Expand.png",
                    'alt': "ExpandCollapse",
                    'aria-label': "expand collapse " + el.getElement('span').get('text')
                }).inject(el, 'top');
                
                var dli = new Element('div', {
                    'class': 'lineH'
                }).inject(el, 'bottom');
                
                el.setProperty('role', 'presentation');
                el.getElement('span').setProperties({
                    'role': 'treeitem',
                    'aria-selected': 'false'
                });
                if (self.hasChildren(el)) {
                    el.getElement('span').setProperties({
                        'aria-expanded': 'false'
                    });
                }
                if (self.hasChildren(el)) {
                    if (!self.isCollapsed(el.getElement(self.options.childSelector))) 
                        self.collapse(el);
                }
            });
            /* Currently not in use because voiceOver makes faults
             this.element.getElements(self.options.selector).each(function(el){
             el.setProperty('role', 'presentation');
             });
             */
            this.element.getElements(self.options.textSelector).each(function(el){
                el.setProperty('tabindex', -1);
            });
            this.element.getElements('a').each(function(el){
                el.setProperty('tabindex', -1);
            });
            this.element.getElement(self.options.textSelector).setProperty('tabindex', 0);
            
            
            this.prepare();
            this.attach();
        },
        
        prepare: function(){
            this.preparation = true;
            this.element.getElements(this.options.listSelector).each(this.updateElement, this);
            
            
            this.preparation = false;
        },
        
        updateElement: function(el){
            var ul = el.getElement(this.options.childSelector), icon = el.getElement(this.options.selector);
            
            if (!this.hasChildren(el)) {
                if (!this.options.animate || this.preparation) 
                    icon.set('opacity', 0);
                else 
                    icon.fade(0);
                return;
            }
            
            if (this.options.animate) 
                icon.fade(this.options.fadeOpacity);
            else 
                icon.set('opacity', this.options.fadeOpacity);
            /*
             if (this.isCollapsed(ul))
             icon.removeClass('tree');
             else
             icon.addClass('tree');
             */
            if (this.isCollapsed(ul)) 
                icon.src = "img/Expand.png";
            else 
                icon.src = "img/Collapse.png";
            
        },
        
        attach: function(){
            var self = this;
            if (this.options.animate) {
                this.element.getElements(self.options.listSelector).each(function(el){
                
                    if (self.hasChildren(el)) {
                        el.getElement(self.options.selector).addEvents({
                            'mouseover': function(){
                                el.getFirst().fade(1);
                            },
                            'mouseleave': function(){
                                el.getFirst().fade(self.options.fadeOpacity);
                            }
                        });
                    }
                });
            }
            this.element.getElement(self.options.textSelector).addEvents({
                focus: function(e){
                    if (this.singleton) {
                        this.singleton = false
                        self.toggleSelection(self.element.getElement(self.options.textSelector), e);
                        self.toggleFocus(self.element.getElement(self.options.textSelector), e);
                    }
                }
.bind(this)
            });
            this.element.addEvents({
                'keydown': function(e){
                    var el = document.activeElement;
                    if (e.key == 'down' && !e.shift && !e.control) {
                        e.stop();
                        self.getNextElement(el).focus();
                        self.toggleSelection(self.getNextElement(el), e);
                        self.toggleFocus(self.getNextElement(el), e);
                    }
                    else 
                        if (e.key == 'up' && !e.shift && !e.control) {
                            e.stop();
                            self.getPrevElement(el).focus();
                            self.toggleSelection(self.getPrevElement(el), e);
                            self.toggleFocus(self.getPrevElement(el), e);
                        }
                        else 
                            if (e.key == 'right' && !e.shift && !e.control) {
                                e.stop();
                                if (self.hasChildren(el.getParent())) {
                                    if (self.isCollapsed(el.getParent().getElement(self.options.childSelector))) {
                                        self.expand(el.getParent());
                                    }
                                    else {
                                        self.getNextElement(el).focus();
                                        self.toggleSelection(self.getNextElement(el), e);
                                        self.toggleFocus(self.getNextElement(el), e);
                                        
                                    }
                                }
                            }
                            else 
                                if (e.key == 'left' && !e.shift && !e.control) {
                                    e.stop();
                                    if (self.hasChildren(el.getParent())) {
                                        if (!self.isCollapsed(el.getParent().getElement(self.options.childSelector))) {
                                            self.collapse(el.getParent());
                                        }
                                        else {
                                            self.getParentElement(el).focus();
                                            self.toggleSelection(self.getParentElement(el), e);
                                            self.toggleFocus(self.getParentElement(el), e);
                                        }
                                    }
                                    else {
                                        self.getParentElement(el).focus();
                                        self.toggleSelection(self.getParentElement(el), e);
                                        self.toggleFocus(self.getParentElement(el), e);
                                    }
                                }
                                else 
                                    if (e.code == 36 && !e.shift && !e.control) {
                                        e.stop();
                                        self.getFirstElement(el).focus();
                                        self.toggleSelection(self.getFirstElement(el), e);
                                        self.toggleFocus(self.getFirstElement(el), e);
                                    }
                                    else 
                                        if (e.code == 35 && !e.shift && !e.control) {
                                            e.stop();
                                            self.getLastElement(el).focus();
                                            self.toggleSelection(self.getLastElement(el), e);
                                            self.toggleFocus(self.getLastElement(el), e);
                                        }
                                        else 
                                            if (e.key == 'up' && e.shift && !e.control) {
                                                e.stop();
                                                for (var i = 0; i < self.treeitems.length; i++) {
                                                    if (self.treeitems[i][1]) {
                                                        if (self.treeitems[i][4] && i != 0) {
                                                            var posi = self.getPositione(self.getPrevElement(self.treeitems[i][0]));
                                                            self.treeitems[posi][4] = true;
                                                            self.treeitems[posi][0].setProperty('aria-selected', 'true');
                                                            self.treeitems[posi][0].addClass('selected');
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            else 
                                                if (e.key == 'down' && e.shift && !e.control) {
                                                    e.stop();
                                                    for (var i = self.treeitems.length - 1; i >= 0; i--) {
                                                        if (self.treeitems[i][1]) {
                                                            if (self.treeitems[i][4] && self.treeitems[i][0] != self.getLastElement(self.treeitems[i][0])) {
                                                            
                                                                var posi = self.getPositione(self.getNextElement(self.treeitems[i][0]));
                                                                self.treeitems[posi][4] = true;
                                                                self.treeitems[posi][0].setProperty('aria-selected', 'true');
                                                                
                                                                self.treeitems[posi][0].addClass('selected');
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                                else 
                                                    if (e.code == 36 && e.shift && !e.control) {
                                                        e.stop();
                                                        for (var i = 0; i < self.treeitems.length; i++) {
                                                            if (self.treeitems[i][1]) {
                                                                if (self.treeitems[i][4]) {
                                                                    break;
                                                                }
                                                                self.treeitems[i][4] = true;
                                                                self.treeitems[i][0].setProperty('aria-selected', 'true');
                                                                self.treeitems[i][0].addClass('selected');
                                                            }
                                                        }
                                                    }
                                                    else 
                                                        if (e.code == 34 && e.shift && !e.control) {
                                                            e.stop();
                                                            for (var i = self.treeitems.length - 1; i >= 0; i--) {
                                                                if (self.treeitems[i][1]) {
                                                                    if (self.treeitems[i][4]) {
                                                                        break;
                                                                    }
                                                                    self.treeitems[i][4] = true;
                                                                    self.treeitems[i][0].setProperty('aria-selected', 'true');
                                                                    self.treeitems[i][0].addClass('selected');
                                                                }
                                                            }
                                                        }
                                                        else 
                                                            if (e.code == 106 && !e.shift && !e.control) {
                                                                e.stop();
                                                                self.expandAll();
                                                            }
                                                            else 
                                                                if (e.key == 'space' && !e.shift && e.control) {
                                                                    e.stop();
                                                                    if (el.getProperty('aria-selected') == 'true') {
                                                                        el.setProperty('aria-selected', 'false');
                                                                        self.treeitems[self.getPositione(el)][4] = false;
                                                                        self.treeitems[self.getPositione(el)][0].removeClass('selected');
                                                                    }
                                                                    else {
                                                                        el.setProperty('aria-selected', 'true');
                                                                        self.treeitems[self.getPositione(el)][4] = true;
                                                                        self.treeitems[self.getPositione(el)][0].addClass('selected');
                                                                    }
                                                                    
                                                                }
                    if (e.key == 'down' && !e.shift && e.control) {
                        e.stop();
                        self.getNextElement(el).focus();
                        self.toggleFocus(el, e);
                    }
                    else 
                        if (e.key == 'up' && !e.shift && e.control) {
                            e.stop();
                            self.getPrevElement(el).focus();
                            self.toggleFocus(el, e);
                        }
                        else 
                            if (e.key == 'right' && !e.shift && e.control) {
                                e.stop();
                                if (self.hasChildren(el.getParent())) {
                                    if (self.isCollapsed(el.getParent().getElement(self.options.childSelector))) {
                                        self.expand(el.getParent());
                                    }
                                    else {
                                        self.getNextElement(el).focus();
                                        self.toggleFocus(el, e);
                                        
                                    }
                                }
                            }
                            else 
                                if (e.key == 'left' && !e.shift && e.control) {
                                    e.stop();
                                    if (self.hasChildren(el.getParent())) {
                                        if (self.isCollapsed(el.getParent().getElement(self.options.childSelector))) {
                                            self.getPrevElement(el).focus();
                                            self.toggleFocus(el, e);
                                        }
                                        else {
                                            self.collapse(el.getParent());
                                        }
                                    }
                                }
                                else 
                                    if (!e.shift && !e.control) {
                                        var breaker = false;
                                        var posi = self.getPositione(el);
                                        for (var i = posi + 1; i < self.treeitems.length; i++) {
                                            if (self.treeitems[i][1]) {
                                                if (self.treeitems[i][3] == String.fromCharCode(e.code)) {
                                                    breaker = true;
                                                    self.treeitems[i][0].focus();
                                                    self.toggleSelection(self.treeitems[i][0], e);
                                                    self.toggleFocus(self.treeitems[i][0], e);
                                                    break;
                                                    
                                                }
                                            }
                                        }
                                        if (!breaker) {
                                            for (var i = 0; i < self.treeitems.length - (self.treeitems.length - posi) + 1; i++) {
                                                if (self.treeitems[i][1]) {
                                                    if (self.treeitems[i][3] == String.fromCharCode(e.code)) {
                                                        breaker = true;
                                                        self.treeitems[i][0].focus();
                                                        self.toggleSelection(self.treeitems[i][0], e);
                                                        self.toggleFocus(self.treeitems[i][0], e);
                                                        break;
                                                        
                                                    }
                                                }
                                            }
                                        }
                                        
                                    }
                }
            });
            
            this.element.getElements(self.options.listSelector).each(function(el){
                var treeitem = el.getElement(self.options.textSelector);
                treeitem.addEvents({
                    'click': function(e){
                        self.toggleSelection(treeitem, e);
                        self.toggleFocus(treeitem, e);
                    }
                });
                if (self.hasChildren(el)) {
                    el.getElement(self.options.selector).addEvents({
                        'click': function(e){
                            self.toggle(el, e);
                            el.getElement(self.options.textSelector).focus();
                            self.toggleSelection(el.getElement(self.options.textSelector), e);
                            self.toggleFocus(el.getElement(self.options.textSelector), e);
                            
                        }
                    });
                }
            });
            return this;
        },
        
        detach: function(){
            this.element.removeEvent('click:relay(' + this.options.selector + ')', this.handler).removeEvent('mouseover:relay(' + this.options.listSelector + ')', this.mouseover).removeEvent('mouseout:relay(' + this.options.listSelector + ')', this.mouseout);
            return this;
        },
        
        hasChildren: function(el){
            if (el.getElement(this.options.childSelector) != null) {
                return true;
            }
            else {
                return false;
            }
        },
        
        isCollapsed: function(ul){
            return ul.getStyle('display') == 'none';
        },
        
        getPositione: function(element){
            for (var i = 0; i < this.treeitems.length; i++) {
                if (element == this.treeitems[i][0]) {
                    return i;
                }
            }
        },
        
        getNextElement: function(element){
            for (var i = 0; i < this.treeitems.length; i++) {
                if (element == this.treeitems[i][0]) {
                    var j = i + 1;
                    while (j < this.treeitems.length) {
                        if (this.treeitems[j][1] == true) 
                            return this.treeitems[j][0];
                        
                        j++;
                    }
                    
                    
                }
                
            }
            return element;
        },
        
        getPrevElement: function(element){
            for (var i = 0; i < this.treeitems.length; i++) {
                if (element == this.treeitems[i][0]) {
                    var j = i - 1;
                    if (j < 0) {
                        return element;
                    }
                    while (j < this.treeitems.length) {
                        if (this.treeitems[j][1] == true) 
                            return this.treeitems[j][0];
                        
                        j--;
                    }
                    
                    
                }
                
            }
            return element;
        },
        
        getParentElement: function(element){
            var parent = element.getParent('ul').getPrevious('span');
            if (parent) {
                return parent;
            }
            return element;
        },
        
        
        getFirstElement: function(element){
            return this.treeitems[0][0];
        },
        
        getLastElement: function(element){
            for (var i = this.treeitems.length - 1; i >= 0; i--) {
                if (this.treeitems[i][1] == true) 
                    return this.treeitems[i][0];
            }
            return element;
        },
        
        expandAll: function(element){
            this.element.getElements(this.options.listSelector).each(function(el){
                if (this.hasChildren(el)) 
                    this.expand(el);
            }
.bind(this));
        },
        
        toggle: function(element, e){
            if (e) 
                e.stop();
            
            var li = element.match(this.options.listSelector) ? element : element.getParent(this.options.listSelector);
            
            if (this.isCollapsed(li.getElement(this.options.childSelector))) 
                this.expand(li);
            else 
                this.collapse(li);
            
            return this;
        },
        
        toggleSelection: function(element, e){
            if (e) 
                e.stop();
            var self = this;
            self.element.getElements(self.options.textSelector).each(function(el){
                el.setProperty('aria-selected', 'false');
                
                el.removeClass('selected');
                
                self.treeitems[self.getPositione(el)][4] = false;
            });
            element.setProperty('aria-selected', 'true');
            element.addClass('selected');
            self.treeitems[this.getPositione(element)][4] = true;
        },
        
        
        toggleFocus: function(element, e){
            if (e) 
                e.stop();
            
            this.element.getElements(this.options.textSelector).each(function(el){
                el.setProperty('tabindex', '-1');
            });
            element.setProperty('tabindex', '0');
        },
        
        expand: function(li){
            var ul = li.getElement(this.options.childSelector);
            ul.setStyle('display', 'block');
            li.getElement(this.options.selector).src = "img/Collapse.png";
            li.getElement('span').setProperties({
                'aria-expanded': 'true'
            });
            var tmp = li.getElement(this.options.childSelector).getChildren(this.options.listSelector)
            
            for (var i = 0; i < tmp.length; i++) {
                this.treeitems[this.getPositione(tmp[i].getElement(this.options.textSelector))][2] = true;
            }
            var tmp = li.getElement(this.options.childSelector).getElements(this.options.listSelector)
            
            for (var i = 0; i < tmp.length; i++) {
                if (this.treeitems[this.getPositione(tmp[i].getElement(this.options.textSelector))][2] == true) {
                    this.treeitems[this.getPositione(tmp[i].getElement(this.options.textSelector))][1] = true;
                }
            }
            return this;
        },
        collapse: function(li){
            var ul = li.getElement(this.options.childSelector);
            ul.setStyle('display', 'none');
            li.getElement(this.options.selector).src = "img/Expand.png";
            li.getElement('span').setProperties({
                'aria-expanded': 'false'
            });
            var tmp = li.getElements(this.options.textSelector);
            var posi = this.getPositione(li.getElement(this.options.textSelector));
            for (var i = posi + 1; i < tmp.length + posi; i++) {
                this.treeitems[i][1] = false;
            }
            var tmp = li.getElement(this.options.childSelector).getChildren(this.options.listSelector);
            
            for (var i = 0; i < tmp.length; i++) {
                this.treeitems[this.getPositione(tmp[i].getElement(this.options.textSelector))][2] = false;
            }
            return this;
        }
        
    });
    
})();
