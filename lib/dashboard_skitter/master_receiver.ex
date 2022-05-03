defmodule DashboardSkitter.MasterReceiver do
    use GenServer
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    alias DashboardSkitter.Workflow, as: Workflow

       @moduledoc """
        Worker nodes need to send updates to the master. It does this by sending messages to this GenServer. The GenServer
        handles the calls so the state of the master is has all the information of the workers.
       """

    def start_link(args) do
        GenServer.start_link(__MODULE__,args, name: {:global, :master})
      end

    def init(init_arg) do
        {:ok, init_arg}
    end

    #The worker has a new metric update. Add it to the system metrics map
    def handle_info({:update_metrics, bdy}, arg) do
        DashboardSkitter.SystemMetrics.add_metric_remote(bdy)
        {:noreply, arg} 
    end

    #The worker has a new log. This log needs to be added to the logs GenServer and send to the client.
    def handle_info({:add_log, bdy}, arg) do
        DashboardSkitter.Logs.add_log(bdy)
        Updates.add_log(bdy)
        {:noreply, arg} 
    end

    #The worker created a new worker. This worker has to be added to the workflow map and this information needs to be send
    #to the client.
    def handle_info({:update_workers, bdy}, arg) do
        Workflow.add_node(:workflow, bdy, :workers)
        Updates.update_workers(Map.put(bdy, :id, bdy.id))
        {:noreply, arg} 
    end

    #The worker linked with another worker.
    def handle_info({:update_edges_workers, bdy}, arg) do
        send_fn = fn(from, to) -> Updates.update_edges_workers(%{from: from, to: to}) end
        Workflow.add_recipient(:workflow, bdy.from, bdy.to, send_fn, :workers)
        {:noreply, arg} 
    end
end