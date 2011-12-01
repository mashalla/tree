Accessible Tree
===========

This plugin creates a tree of a nested html list with subtrees that can be extended and collapsed.

Widget based on <a href="http://mootools.net/forge/p/mootools_tree_components">Tree</a> by Christoph Pojer!

![Screenshot](http://www.accessiblemootoolsdemo.iao.fraunhofer.de/Mootools_Widgets/WidgetThumbs/Tree.png)

How to use
----------

Create a nested list

	#HTML
	<ul class="tree" id="tree">
        <li id="tree3">
            <span>Tree Structure</span>
            <ul>
                <li>
					<span>Bark</span>
                    <ul>
                        <li>
							<span>Periderm</span>
                            <ul>
                                <li>
									<span>Cork</span>
								</li>
                                <li>
									<span>Cork Cambium</span>
								</li>
                            </ul>
                        </li>
                        <li>
							<span>Living Phloem</span>
						</li>
                    </ul>
                </li>
                <li><span>Sapwood</span>
                <ul>
                    <li>
                        <span>Vascular Cambium</span>
                    </li>
                    <li>
                        <span>Radial Section</span>
                    </li>
                </ul>
                </li>
                <li>
                    <span>Heartwood</span>
                </li>
            </ul>
        </li>
    </ul>
	
and call

	#HTML
	new Tree('tree');
	
with the id of the tree so that it can be converted. That's all :)