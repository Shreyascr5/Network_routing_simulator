#ifndef GRAPH_H
#define GRAPH_H

#include <bits/stdc++.h>
using namespace std;

class Graph
{
public:
    int V;
    vector<vector<pair<int, int>>> adj;

    Graph(int V);

    void addEdge(int u, int v, int w);
    void printGraph();
    vector<int> dijkstra(int src);
};

#endif