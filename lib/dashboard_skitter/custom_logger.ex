defmodule DashboardSkitter.CustomLogger do
    require Logger
    alias DashboardSkitterWeb.WebUpdates, as: Updates

    def init(__MODULE__) do
        {:ok, %{name: :error_log}}
    end
    
    def handle_event({_, _, {_, msg, {_, {h, m, sec, msec}}, meta}}, state) do
        erl_level = meta[:erl_level]
        
        if erl_level != :notice do
            if meta[:application] != :phoenix do
                bdy = %{
                    erl_level: erl_level,
                    msg: msg,
                    name: Skitter.Remote.self(),
                    hour: h,
                    min: m,
                    sec: sec,
                    msec: msec,
                }
                if(Skitter.Runtime.mode != :worker) do
                    DashboardSkitter.Logs.add_log(bdy)
                end
                Updates.add_log(bdy)
            end
        end
        {:ok, state}
    end
end