;; extends
;; Travis, 26.0825: with treesitter driving HTML highlighting, the legacy
;; `htmlItalic` / `htmlBold` syntax groups never fire, and the html grammar
;; does not emit @markup.italic / @markup.strong for <i>/<em>/<b>/<strong>
;; text (only the markdown grammar does). base16.lua re-asserts those
;; groups' italic/bold attrs, but nothing was capturing the text — so the
;; journal's <i> elements rendered plain. This query supplies the capture.

((element
   (start_tag (tag_name) @_tag)
   (text) @markup.italic)
 (#any-of? @_tag "i" "em"))

((element
   (start_tag (tag_name) @_tag)
   (text) @markup.strong)
 (#any-of? @_tag "b" "strong"))
