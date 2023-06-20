
const React = require('react');
const ReactDOM = require('react-dom/client');
const {
  Button,
  Dropdown,
  Table,
} = require('bens_ui_components');
const CreateUserCard = require('../components/CreateUserCard.react');
const {axiosInstance} = require('../auth');
const {useState, useEffect, useMemo} = React;


const tableNames = [
  'users',
];
const filterableCols = [
  'permissionlevel',
];

const maxWidthCols = {
  username: 20,
  email: 20,
  lastLogin: 50,
};

const rowToKey = (row) => {
  if (!row.hostname || !row.path) return false;
  return row.hostname + '_' + row.path + '_' + row.map;
}

function Main(props) {
  const [table, setTable] = useState('users');
  const [rows, setRows] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [inRefresh, setInRefresh] = useState(true);

  // getting data
  useEffect(() => {
    axiosInstance
      .get('/auth/list_users')
      .then(res => {
        // console.log(JSON.stringify(res.data));
        setInRefresh(false);
        let rows = [];
        for (const row of res.data) {
          if (row.username == 'admin') {
            rows.push(row);
          } else {
            rows.push({...row,
              Delete: <DeleteButton onClick={() => {
                axiosInstance.post('/auth/delete', {username: row.username})
                  .then(() => {
                    setInRefresh(true);
                    setRefresh((refresh + 1) % 2);
                  });
              }} />
            });
          }
        }
        setRows(rows)
      });
  }, [table, refresh]);

  const columns = useMemo(() => {
    const cols = {};
    for (const row of rows) {
      for (const col in row) {
        if (!cols[col]) {
          cols[col] = {};
          if (filterableCols.includes(col)) {
            cols[col].filterable = true;
          }
          if (maxWidthCols[col]) {
            cols[col].maxWidth = maxWidthCols[col];
          }
          if (col == 'numLogins' || col == 'permissionlevel') {
            cols[col].sortFn = (a, b) => {
              let numA = parseInt(a[col].split(' ')[0]) || 0;
              let numB = parseInt(b[col].split(' ')[0]) || 0;
              return numA - numB;
            }
          }
        }
      }
    }
    return cols;
  }, [rows, refresh]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#faf8ef',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 50,
      }}
    >
      <CreateUserCard
        onSuccess={() => {
          setInRefresh(true);
          setRefresh((refresh + 1) % 2);
        }}
      />
      <Table
        style={{
          width: 'initial',
          paddingTop: 15,
        }}
        columns={columns}
        rows={rows}
      />
    </div>
  );
}

const DeleteButton = (props) => {
  const [areYouSure, askAreYouSure] = useState(false);

  return (
    <span>
      {areYouSure ? (<Button label="Cancel" onClick={() => askAreYouSure(false)} />) : null}
      <Button
        label={areYouSure ? "Delete" : "X"}
        onClick={() => {
          if (!areYouSure) {
            askAreYouSure(true);
          } else {
            props.onClick();
          }
        }}
      />
    </span>
  );
}


function renderUI(root) {
  root.render(
    <Main />
  );
}
const root = ReactDOM.createRoot(document.getElementById('container'));
renderUI(root);


