defmodule DashboardSkitterWeb.WebUpdates do
    alias DashboardSkitterWeb.UserChannel, as: UserChannel

    @behaviour DashboardSkitter.SendUpdateBehaviour

    def update_workers(bdy) do 
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_workers(bdy)
        end 
    end
    def update_edges_workers(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.update_edges_workers(bdy)
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
        end   
    end
    def add_log(bdy) do
        if Skitter.Runtime.mode() != :worker do
            UserChannel.add_log(bdy)
        end    
    end
end