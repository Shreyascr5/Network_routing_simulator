#include "../include/Graph.h"
#include <iostream>
#include <queue>
#include <climits>
#include <algorithm>

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

void Graph::removeEdge(int u, int v)
{
    adj[u].erase(remove_if(adj[u].begin(), adj[u].end(),
                           [v](pair<int, int> p)
                           { return p.first == v; }),
                 adj[u].end());

    adj[v].erase(remove_if(adj[v].begin(), adj[v].end(),
                           [u](pair<int, int> p)
                           { return p.first == u; }),
                 adj[v].end());
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

vector<int> Graph::dijkstra(int src, vector<int> &parent)
{
    vector<int> dist(V, INT_MAX);
    parent.assign(V, -1);

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
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}

vector<int> Graph::getPath(int dest, vector<int> &parent)
{
    vector<int> path;

    while (dest != -1)
    {
        path.push_back(dest);
        dest = parent[dest];
    }

    reverse(path.begin(), path.end());
    return path;
}