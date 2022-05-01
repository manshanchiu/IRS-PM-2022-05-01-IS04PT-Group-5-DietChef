import pandas as pd
def read(filepath,header = None):
    df = pd.read_csv(filepath)
    _header = []
    _header = df.keys().tolist()
    # if header presents then override csv header
    if header != None:
        _header = header
    rows = []
    for row in df.values.tolist():
        _row = {}
        for i,v in enumerate(row):
            if len(header) > i:
                _row[_header[i]] = v
        rows.append(_row)
    return rows


