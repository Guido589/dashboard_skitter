use Skitter.DSL

wf = workflow do
  stream_source(1..20)
  ~> print()
end |> Skitter.Runtime.deploy()