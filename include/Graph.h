#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <utility>

class Graph
{
public:
    int V;
    std::vector<std::vector<std::pair<int, int>>> adj;

    Graph(int V);

    void addEdge(int u, int v, int w);
    void removeEdge(int u, int v);
    void printGraph();

    std::vector<int> dijkstra(int src, std::vector<int> &parent);
    std::vector<int> getPath(int dest, std::vector<int> &parent);
};

#endif