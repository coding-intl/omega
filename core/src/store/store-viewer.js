import omega from '../renderer';

const styles = {};

styles.getViewerStyle = (open) => {
  const style = {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    maxWidth: '50%',
    paddingLeft: '16px',
    fontFamily: 'monospace',
    color: 'rgb(255, 255, 255)',
    overflowY: 'auto',
    transform: 'translateX(100%) translateX(-16px)',
    transition: 'all .3s ease',
  };
  if (open) {
    style.boxShadow = '0 0 8px rgba(0,0,0,0.5)';
    style.background = 'rgb(51, 51, 51)';
    style.transform = 'translateX(0)';
  }
  return style;
};

styles.viewerClosed = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  maxWidth: '50%',
  paddingLeft: '16px',
  fontFamily: 'monospace',
  color: 'rgb(255, 255, 255)',
  overflowY: 'auto',
};

styles.wrapper = {
  position: 'relative',
  padding: '10px 25px 10px 10px',
};

styles.openCloseButton = {
  position: 'absolute',
  left: '0',
  top: '50%',
  lineHeight: '22px',
  fontSize: '16px',
  padding: '2px',
  width: '12px',
  transform: 'translateY(-50%)',
  color: 'rgb(0, 0, 0)',
  background: 'rgb(204, 204, 204)',
  textAlign: 'center',
  cursor: 'pointer',
  userSelect: 'none',
};

styles.param = {};

styles.paramHidden = {
  opacity: '.5',
};

styles.paramKey = {
  color: '#df92e1',
  marginRight: '4px',
};

styles.number = {
  color: '#6292ff',
};

styles.string = {
  color: '#62ff92',
};

styles.boolean = {
  color: '#ffff92',
};

styles.null = {
  color: '#a6a6a6',
};

styles.object = {
  paddingLeft: '10px',
  borderLeft: '1px dashed rgba(255, 255, 255, 0.25)',
};


const Param = ({value, key, middleware}) => {
  return (
    <div
      style={key && /^(.*\.)?_[^.]*$/i.test(key) ? styles.paramHidden : styles.param}
    >
      <span style={styles.paramKey}>{key}</span>
      {
        value && value.switch
          ? value.switch(
            value => typeof value,
            {
              number: v => <span style={styles.number}>{v}</span>,
              string: v => <span style={styles.string}>{v}</span>,
              boolean: v => <span style={styles.boolean}>{v}</span>,
              object: v => <ObjectTag value={value} middleware={middleware}/>,
            },
            v => <span style={styles.null}>{v}</span>,
          )
          : value
      }
    </div>
  );
};

const ObjectTag = ({value, middleware}) => {
  return (
    <div style={styles.object}>
      {
        value && value.map(
          (value, key) => {
            value = middleware ? middleware(value, key) : value;
            return <Param value={value} key={key} middleware={middleware}/>;
          },
        )
      }
    </div>
  );
};

const OpenCloseButton = ({open}) => {
  const onClick = event => open.set(isOpen => !isOpen);
  return (
    <pre style={styles.openCloseButton} onClick={onClick}>
      {open.transform(open => open ? '>\n>\n>' : '<\n<\n<')}
    </pre>
  );
};

const StoreViewer = ({middleware}, state, {store}) => {
  const open = state.child('open');
  return (
    <div style={open.transform(styles.getViewerStyle)}>
      <OpenCloseButton open={open}/>
      <div style={styles.wrapper}>
        <ObjectTag middleware={middleware} value={store}/>
      </div>
    </div>
  );
};

StoreViewer.data = {
  store: '',
};

StoreViewer.initialState = {
  open: false,
};

export const createStoreViewer = (appendTo, store, middleware) => {
  omega.render(
    <StoreViewer middleware={middleware}/>,
    appendTo,
    store,
  );
};

export default createStoreViewer;