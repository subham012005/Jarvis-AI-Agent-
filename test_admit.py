import win32com.client
try:
    conn = win32com.client.Dispatch('ADODB.Connection')
    conn.Open('Provider=Search.CollatorDSO;Extended Properties="Application=Windows"')
    rs = conn.Execute("SELECT System.ItemPathDisplay FROM SystemIndex WHERE System.FileName LIKE '%admit%'")[0]
    paths = []
    while not rs.EOF:
        path = rs.Fields.Item('System.ItemPathDisplay').Value
        if path:
            paths.append(path)
        rs.MoveNext()
    print("Results:", paths[:10])
except Exception as e:
    print("Error:", e)
