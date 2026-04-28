#include "../include/Graph.h"
#include <iostream>

using namespace std;

Graph::Graph(int V)
{
    this->V = V;
    adj.resize(V);
}

void Graph::addEdge(int u, int v, int w)
{
    adj[u].push_back({v, w});
    adj[v].push_back({u, w});
}

void Graph::printGraph()
{
    for (int i = 0; i < V; i++)
    {
        cout << "Router " << i << " -> ";
        for (auto &edge : adj[i])
        {
            cout << "(" << edge.first << ", cost=" << edge.second << ") ";
        }
        cout << endl;
    }
}

vector<int> Graph::dijkstra(int src)
{
    vector<int> dist(V, INT_MAX);

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty())
    {
        int u = pq.top().second;
        pq.pop();

        for (auto &edge : adj[u])
        {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v])
            {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}