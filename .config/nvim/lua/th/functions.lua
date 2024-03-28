----------------------------------------------------------
-- RUNNING PYTESTS FROM WITHIN VIM
-- vim-test transformation to run nose tests via `make singletest`.
-- If a command looks like "nosetests ...", transform it to
-- "make singletest PYTESTARGS='...'"
function HonorTransform (cmd)
    -- command if not using docker
    local cmd_sans_pytest = 

    -- "-s ".substitute(a:cmd, '^\(poetry\|pipenv\) run pytest ', '', '')
    let l:new_cmd = 'make singletest PARALLELISM=1 PYTESTARGS='.shellescape(l:cmd_sans_pytest)
    return l:new_cmd
end
