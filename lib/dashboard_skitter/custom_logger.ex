defmodule DashboardSkitter.CustomLogger do
    require Logger
    alias DashboardSkitterWeb.WebUpdates, as: Updates

    def init(__MODULE__) do
        {:ok, %{name: :error_log}}
    end
    
    def handle_event(info, state) do
        erl_level = elem(elem(info, 2), 3)[:erl_level]
        
        if erl_level != :notice do
            if elem(elem(info, 2), 3)[:application] != :phoenix do
                IO.inspect info
                msg = elem(elem(info, 2), 1)
                time = elem(elem(elem(info, 2), 2), 1)
                bdy = %{
                    erl_level: erl_level,
                    msg: msg,
                    hour: elem(time, 0),
                    min: elem(time, 1),
                    sec: elem(time, 2),
                    msec: elem(time, 3),
                }
                DashboardSkitter.Logs.add_log(bdy)
                Updates.add_log(bdy)
            end
        end
        {:ok, state}
    end
end