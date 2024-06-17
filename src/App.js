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
  port = '80';
  socketPort = '80';

  // host = 'localhost';
  // port = '8000';
  // socketPort = '8001';

  state = {
    filledForm: false,
    messages: [],
    value: "",
    sender: "1799",
    drug: new URLSearchParams(window.location.search).get('order_id'),
    receiver: new URLSearchParams(window.location.search).get('buyer_id'),
  };

  get_room = () => this.state.drug;
  //     `${this.state.drug}_${this.state.sender > this.state.receiver
  //     ? `${this.state.receiver}_${this.state.sender}`
  //     : `${this.state.sender}_${this.state.receiver}`
  // }`
  ;

  client = new W3CWebSocket(`ws://${this.host}:${this.socketPort}/ws/` + this.get_room() + "/");



  onButtonClicked = (e) => {

    this.client.send(
        JSON.stringify({
          type: "message",
          message: this.state.value,
          sender_id: this.state.sender,
          receiver_id: this.state.receiver,
          order_id: this.state.drug,
        })
    );
    this.state.value = "";
    e.preventDefault();
  };

  componentDidMount() {
    fetch(`http://${this.host}:${this.port}/api/v1/message?order_id=${this.state.drug}&receiver_id=${this.state.receiver}&sender_id=${this.state.sender}&format=json`).then(
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
          {(
              <div style={{marginTop: 50}}>
                Room Name: {this.get_room()}
                <Paper
                    style={{height: 500, maxHeight: 500, overflow: "auto", boxShadow: "none",}}
                >
                  {this.state.messages.map((message) => (
                      <>
                        <Card className={classes.root}>
                          <CardHeader title={message.name} subheader={message.msg}/>
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
                               this.setState({value: e.target.value});
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
          )}
        </Container>
    );
  }
}
export default withStyles(useStyles)(App);
