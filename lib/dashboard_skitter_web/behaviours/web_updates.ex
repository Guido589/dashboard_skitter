defmodule DashboardSkitterWeb.WebUpdates do
    alias DashboardSkitterWeb.UserChannel, as: UserChannel

    @behaviour DashboardSkitter.SendUpdateBehaviour

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