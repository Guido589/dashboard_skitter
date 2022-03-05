# DashboardSkitter

To use the Dashboard Skitter application:

* Add to `deps` in `mix.exs`
  <ol>
    <li><code>{:dashboard_skitter, github: "Guido589/dashboard_skitter"}</code> </li>
    <li><code>{:phoenix_live_reload, "~> 1.2", only: :dev}</code> </li>
  </ol>  
* Copy all of the [`dashboard_skitter/config`](https://github.com/Guido589/dashboard_skitter/tree/main/config) files into your project
* After that run `mix deps.get`
* Start Phoenix endpoint run `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
