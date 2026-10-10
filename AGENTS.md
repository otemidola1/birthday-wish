<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the two birthday pages on public TanStack routes with a shared presentation shell so both retain one design system.
- Validate guest gifts with the shared Zod schema on both client and server; use server-only Bachs checkout requests so credentials never enter the browser.
- Store guest wishes in private, RLS-locked Cloud tables and rate-limit public submissions through a service-only database function; guests do not need accounts.
- Use the public preview origin for Bachs return URLs only during localhost testing; hosted requests use their own origin because Bachs rejects localhost callbacks.
