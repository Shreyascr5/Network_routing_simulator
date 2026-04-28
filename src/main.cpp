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

    g.printGraph();

    vector<int> dist = g.dijkstra(0);

    cout << "\nShortest distances from Router 0:\n";
    for (int i = 0; i < dist.size(); i++)
    {
        cout << "To " << i << " = " << dist[i] << endl;
    }

    return 0;
}