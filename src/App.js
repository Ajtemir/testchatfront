import React, {Component, useEffect} from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Paper from "@material-ui/core/Paper";

import { withStyles } from "@material-ui/core/styles";

const useStyles = (theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

class App extends Component {
  host = 'kutai.kg';
  port = '8888';
  socketPort = '8888';

  // host = 'localhost';
  // port = '8000';
  // socketPort = '8001';

  state = {
    filledForm: false,
    messages: [],
    value: "",
    sender: "1788",
    drug: "2562",
    receiver: "1799",
  };

  get_room = () => `${this.state.drug}_${this.state.sender > this.state.receiver 
      ? `${this.state.receiver}_${this.state.sender}`
      : `${this.state.sender}_${this.state.receiver}`
  }`;

  client = new W3CWebSocket(`ws://${this.host}:${this.socketPort}/ws/` + this.get_room() + "/");



  onButtonClicked = (e) => {

    this.client.send(
        JSON.stringify({
          type: "message",
          message: this.state.value,
          sender_id: this.state.sender,
          receiver_id: this.state.receiver,
          drug_id: this.state.drug,
        })
    );
    this.state.value = "";
    e.preventDefault();
  };

  componentDidMount() {
    fetch(`http://${this.host}:${this.port}/api/v1/message?drug_id=${this.state.drug}&receiver_id=${this.state.receiver}&sender_id=${this.state.sender}&format=json`).then(
        value => value.json().then(data => {
          this.setState((state) => ({
            ...state,
            messages: data.messages.map(i =>( {
              msg: i.text,
              name: i.sender,
            }))
          }))
        })
    )
    this.client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    this.client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        this.setState((state) => ({
          messages: [
            ...state.messages,
            {
              msg: dataFromServer.text,
              name: dataFromServer.sender,
            },
          ],
        }));
      }
    };
  }

  render() {
    const { classes } = this.props;
    return (
        <Container component="main" maxWidth="xs">
          {this.state.filledForm ? (
              <div style={{ marginTop: 50 }}>
                Room Name: {this.get_room()}
                <Paper
                    style={{height: 500, maxHeight: 500, overflow: "auto", boxShadow: "none", }}
                >
                  {this.state.messages.map((message) => (
                      <>
                        <Card className={classes.root}>
                          <CardHeader title={message.name} subheader={message.msg} />
                        </Card>
                      </>
                  ))}
                </Paper>
                <form
                    className={classes.form}
                    noValidate
                    onSubmit={this.onButtonClicked}
                >
                  <TextField id="outlined-helperText" label="Write text" defaultValue="Default Value"
                             variant="outlined"
                             value={this.state.value}
                             fullWidth
                             onChange={(e) => {
                               this.setState({ value: e.target.value });
                               this.value = this.state.value;
                             }}
                  />
                  <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
          ) : (
              <div>
                <CssBaseline />
                <div className={classes.paper}>
                  <form
                      className={classes.form}
                      noValidate
                      onSubmit={(value) => this.setState({ filledForm: true })}
                  >
                    <TextField variant="outlined" margin="normal" required fullWidth label="Drug"
                               name="Drug"
                               autoFocus
                               value={this.state.drug}
                               onChange={(e) => {
                                 this.setState({ drug: e.target.value });
                                 this.value = this.state.drug;
                               }}
                    />
                    <TextField variant="outlined" margin="normal" required fullWidth name="sender" label="sender"
                               type="sender"
                               id="sender"
                               value={this.state.sender}
                               onChange={(e) => {
                                 this.setState({ sender: e.target.value });
                                 this.value = this.state.sender;
                               }}
                    />

                    <TextField variant="outlined" margin="normal" required fullWidth name="receiver" label="receiver"
                               type="receiver"
                               id="receiver"
                               value={this.state.receiver}
                               onChange={(e) => {
                                 this.setState({ receiver: e.target.value });
                                 this.value = this.state.receiver;
                               }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                      Submit
                    </Button>
                  </form>
                </div>
              </div>
          )}
        </Container>
    );
  }
}
export default withStyles(useStyles)(App);
