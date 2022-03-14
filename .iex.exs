use Skitter.DSL

stream =
  1..20
  |> Stream.cycle()
  |> Stream.map(fn el ->
    Process.sleep(1000) # wacht 1s
    el
  end)

wf = workflow do
  #stream_source(stream)
  stream_source(1..20)
  ~> print()
end #|> Skitter.Runtime.deploy(wf)