Galactic Vision is a space themed web application that serves as a 3D explorer for the Stellar network. The goal of the project is to give the average stellar enthusiast a resource to better understand what is happening on the stellar network. Since the stellar network has a heavy emphasis on asset transfer, I wanted to create a way that shows this activity that is both entertaining and informative. Standard Stellar explorers revolve around displaying plain text about transaction data, which can often be hard to make sense of.

The project is split into two areas, Stellar Explorer (visualization of stellar horizon data) and Quorum Explorer (visualization of stellar core data).

Stellar Explorer

![](https://i.imgur.com/rfHXmin.gif)

Stellar Explorer represents live data about user activity on the network. Network activity can either be observed from a glance, or interacted with to get more information. The current setup involves a space station representing the stellar network as the centerpiece. As data comes in, planets are spawned around the space station to represent accounts. Particles are emitted from the planets to represent assets. The most popular cryptos are colour coded (click the ? icon to view this legend). The particles travel to the space station to be processed, then are directed to the destination planet to finish the operation.

![](https://i.imgur.com/7gDfMQC.gif)

Each planet is able to be clicked on to enter account view. This allows the user to explore the balances and recent history of the account. There will also be a transaction view to replay any transaction animation and view additional data.

![](https://i.imgur.com/DgXqDGa.gif)

Quorum Explorer

![](https://i.imgur.com/6kYNUS2.gif)

Quorum Explorer is a visualization of quorum sets. It displays a globe with official validator node locations and creates links between them to represent each nodes quorum set. The user can isolate each node to see its connections and learn more specific information about it. When viewing a node, green links represent nodes that the current node trusts, and cyan links represent nodes that trust the current node. The sidebar is sorted by trust index. The more nodes trust a specific node, the higher its trust index. Credit to stellarbeat.io for the data.

There are three ways to navigate to nodes. You can either use the side bar navigation on the left, click the pins the globe, or use the node info sidebar on the right to travel to related nodes.
End Goal

This will be an ongoing project that is constantly maintained and upgraded with new features. The vision of the project is to make a complete 3D hub that covers all areas of activity on the network. The popularity of projects such as the IOTA tangle visualizer show that interactive visualizations are one of the most effective ways to inform members of the community about the activity on the network. Being able to screenshot images of network activity and share them on platforms such as reddit is a useful way to generate discussion and raise awareness.

Coming Soon

-Ui improvements (more readable text to describe operations, cleaner navigation)
-More node information
-More account statistics
-Account search (view your own accounts planet!)
-Space station upgrade

In the future

-Transaction view (replays asset transfer animation between two planets)
-Exchange activity view (same concept as the base view, but isolated to an exchange)
-Asset activity view
-Unique planet generation for each account
-Quorum history and statistics (that make sense at face value)
-Walkthroughs/tutorials on network functionality (explain how the network works with an interactive scene)
