#include "../include/Graph.h"
#include <iostream>

using namespace std;

int main()
{
    Graph g(5);

    g.addEdge(0, 1, 10);
    g.addEdge(0, 2, 5);
    g.addEdge(1, 3, 2);
    g.addEdge(2, 3, 3);
    g.addEdge(3, 4, 1);

    cout << "Network Topology:\n";
    g.printGraph();

    vector<int> parent;
    vector<int> dist = g.dijkstra(0, parent);

    int destination = 4;

    cout << "\nShortest distance: " << dist[destination] << endl;

    vector<int> path = g.getPath(destination, parent);

    cout << "Path: ";
    for (int node : path)
        cout << node << " ";
    cout << endl;

    cout << "\nSimulating Packet Routing:\n";

    for (int i = 0; i < path.size(); i++)
    {
        cout << "Packet at Router " << path[i] << endl;

        if (i != path.size() - 1)
        {
            cout << "→ moving to Router " << path[i + 1] << endl;
        }
    }

    cout << "Packet delivered successfully ✅\n";

    // 🔥 LINK FAILURE SIMULATION
    cout << "\n--- Simulating Link Failure (2 - 3) ---\n";

    g.removeEdge(2, 3);

    cout << "\nUpdated Network:\n";
    g.printGraph();

    vector<int> parent2;
    vector<int> dist2 = g.dijkstra(0, parent2);

    vector<int> newPath = g.getPath(destination, parent2);

    cout << "\nNew shortest distance: " << dist2[destination] << endl;

    cout << "New Path: ";
    for (int node : newPath)
        cout << node << " ";
    cout << endl;

    cout << "\nRe-routing Packet:\n";

    for (int i = 0; i < newPath.size(); i++)
    {
        cout << "Packet at Router " << newPath[i] << endl;

        if (i != newPath.size() - 1)
        {
            cout << "→ moving to Router " << newPath[i + 1] << endl;
        }
    }

    cout << "Packet delivered after rerouting ✅\n";

    return 0;
}