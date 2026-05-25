#include "../include/Graph.h"
#include <iostream>
#include <climits>

using namespace std;

void simulatePacket(Graph &g, int source, int destination)
{
    vector<int> parent;
    vector<int> dist = g.dijkstra(source, parent);

    // no route exists
    if (destination >= g.V || dist[destination] == INT_MAX)
    {
        cout << "\nNo route available\n";
        cout << "Packet dropped ❌\n";
        return;
    }

    vector<int> path = g.getPath(destination, parent);

    cout << "\nShortest Distance = "
         << dist[destination] << endl;

    cout << "Path: ";

    for (int node : path)
        cout << node << " ";

    cout << "\n\nPacket Simulation:\n";

    for (int i = 0; i < path.size(); i++)
    {
        cout << "Packet at Router "
             << path[i] << endl;

        if (i != path.size() - 1)
        {
            cout << "-> moving to Router "
                 << path[i + 1]
                 << endl;
        }
    }

    cout << "Packet Delivered ✅\n";
}

int main()
{
    int routers, edges;

    cout << "Enter number of routers: ";
    cin >> routers;

    Graph g(routers);

    cout << "Enter number of links: ";
    cin >> edges;

    cout << "\nFormat: source destination cost\n";

    for (int i = 0; i < edges; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;

        g.addEdge(u, v, w);
    }

    int choice;

    do
    {
        cout << "\n========== NETWORK MENU ==========\n";
        cout << "1. Show topology\n";
        cout << "2. Route packet\n";
        cout << "3. Remove link\n";
        cout << "4. Add link\n";
        cout << "5. Exit\n";

        cin >> choice;

        switch (choice)
        {

        case 1:
            g.printGraph();
            break;

        case 2:
        {
            int s, d;

            cout << "Source: ";
            cin >> s;

            cout << "Destination: ";
            cin >> d;

            simulatePacket(g, s, d);

            break;
        }

        case 3:
        {
            int u, v;

            cout << "Remove edge (u v): ";
            cin >> u >> v;

            g.removeEdge(u, v);

            cout << "Link removed\n";

            break;
        }

        case 4:
        {
            int u, v, w;

            cout << "Add edge (u v cost): ";
            cin >> u >> v >> w;

            g.addEdge(u, v, w);

            cout << "Link added\n";

            break;
        }

        case 5:
            cout << "Exiting...\n";
            break;

        default:
            cout << "Invalid choice\n";
        }

    } while (choice != 5);

    return 0;
}