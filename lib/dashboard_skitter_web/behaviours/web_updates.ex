defmodule DashboardSkitterWeb.WebUpdates do
    alias DashboardSkitterWeb.UserChannel, as: UserChannel

    @behaviour DashboardSkitter.SendUpdateBehaviour

    @moduledoc """
        Implements the SendUpdateBehaviour. These procedure are called if there is an update in dashboard_skitter.
        In this implementation it sends an upddate to the userchannel or to the GenServer of the master node.
        Every procedure checks if the dashboard is started as a worker or master. In worker nodes no update needs to be send to
        the UserChannel. It needs to send a message to the master node but it first needs to check if the master node is already started. This
        it to prevent sending a message to the master before it the master started. In master or local nodes the update needs to be send to the channel.
    """

    def update_workers(bdy) do 
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_workers(bdy)
        else
            if length(:global.registered_names) != 0 do
                :global.send(:master, {:update_workers ,bdy})
            end
        end 
    end

    def update_edges_workers(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_edges_workers(bdy)
        else
            if length(:global.registered_names) != 0 do
                :global.send(:master, {:update_edges_workers ,bdy})
            end
        end  
    end

    def update_components(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_components(bdy)
        end    
    end

    def update_edges_components(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_edges_components(bdy)
        end     
    end

    def started(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.started(bdy)
        end   
    end

    def update_metrics(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_metrics(bdy)
        else
            if length(:global.registered_names) != 0 do
                :global.send(:master, {:update_metrics ,bdy})
            end
        end   
    end
    
    def add_log(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.add_log(bdy)
        else
            if length(:global.registered_names) != 0 do
                :global.send(:master, {:add_log ,bdy})
            end
        end    
    end
end