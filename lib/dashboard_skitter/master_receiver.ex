defmodule DashboardSkitter.MasterReceiver do
    use GenServer
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    alias DashboardSkitter.Workflow, as: Workflow

    def start_link(args) do
        GenServer.start_link(__MODULE__,args, name: {:global, :master})
      end

    def init(init_arg) do
        {:ok, init_arg}
    end

    def handle_info({:update_metrics, bdy}, arg) do
        DashboardSkitter.SystemMetrics.add_metric_remote(bdy)
        {:noreply, arg} 
    end

    def handle_info({:add_log, bdy}, arg) do
        DashboardSkitter.Logs.add_log(bdy)
        {:noreply, arg} 
    end

    def handle_info({:update_workers, bdy}, arg) do
        Workflow.add_node(:workflow, bdy, :workers)
        Updates.update_workers(bdy)
        {:noreply, arg} 
    end

    def handle_info({:update_edges_workers, bdy}, arg) do
        send_fn = fn(from, to) -> Updates.update_edges_workers(%{from: from, to: to}) end
        Workflow.add_recipient(:workflow, bdy.from, bdy.to, send_fn, :workers)
        {:noreply, arg} 
    end
end