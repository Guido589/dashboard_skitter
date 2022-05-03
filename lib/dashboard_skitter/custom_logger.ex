defmodule DashboardSkitter.CustomLogger do
    require Logger
    alias DashboardSkitterWeb.WebUpdates, as: Updates

    @moduledoc """
    Cutom logger to save log messages in the Logs GenServer
    """

    def init(__MODULE__) do
        {:ok, %{name: :error_log}}
    end
    
    #is invoked when a new log message is send to the console
    def handle_event({_, _, {_, msg, {_, {h, m, sec, msec}}, meta}}, state) do
        erl_level = meta[:erl_level]
        
        if erl_level != :notice do #do not save notice type messages
            if meta[:application] != :phoenix do #do not save phoenix log messages
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
                    DashboardSkitter.Logs.add_log(bdy) #do not save log message in worker, only send it to master
                end
                Updates.add_log(bdy)
            end
        end
        {:ok, state}
    end
end