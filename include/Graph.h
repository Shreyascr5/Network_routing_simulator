#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <utility> // for pair
#include <queue>
#include <climits>

class Graph
{
public:
    int V;
    std::vector<std::vector<std::pair<int, int>>> adj;

    Graph(int V);

    void addEdge(int u, int v, int w);
    void printGraph();
    std::vector<int> dijkstra(int src);
};

#endif