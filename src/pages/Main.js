import React, { Component } from 'react';
import { FaPen, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { Button, Modal, Form } from 'react-bootstrap';
import { Form as Unform, Input } from '@rocketseat/unform';
import axios from 'axios';

import './Main.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default class Main extends Component {

  state = {
    servers: [],
    serverEdit: {},
    modalNewServer: false,
    modalEditServer: false,
  };

  componentDidMount() {
    this.fetchData();

    // setTimeout(async () => {
    this.watchStatus();
    // }, 1000);
  }

  fetchData = async () => {
    const data = localStorage.getItem('servers');

    if(data) {
      const serv = JSON.parse(data);

      const newServers = serv.map((server, index) => ({
        ...server,
        id: index + 1,
        status: "warn",
        buildURL() { return `${this.url}${this.port ? `:${this.port}` : ''}${this.post_url}`}
      }))

      console.log("Servers from localStorage -> ", newServers);
      this.setState({ servers: newServers });
    } else {
      this.setState({ servers: [] });
    }
  }

  watchStatus = async () => {
    const servers = this.state.servers;

    await servers.map(async server => {
      try {
        await axios.get(server.buildURL());
        let change = false;

        const serv = servers.map(data => {
          if(data.id === server.id && data.status !== 'up') {
            change = true;
            return { ...data, status: 'up' };
          }
          return data;
        })

        if(serv !== servers && change) {
          await this.setState({ servers: serv });
          await this.sendNotification(`You server ${server.name} is up`);
        }
      } catch(err) {
        let change = false;

        const serv = servers.map(data => {
          if(data.id === server.id && data.status !== 'down') {
            change = true;
            return { ...data, status: 'down' }
          }
          return data;
        })

        if(serv !== servers && change) {
          await this.setState({ servers: serv });
          await this.sendNotification(`You server ${server.name} is down`);
        }
      }
    })

    console.log("servers -> ", servers);

    setTimeout(async () => {
      await this.watchStatus();
    }, 5000);
  }

  sendNotification = msg => {
    ipcRenderer.send('notification', msg);
  }

  toggleModalNewServer = () => this.setState({ modalNewServer: !this.state.modalNewServer });
  toggleModalEditServer = () => this.setState({ modalEditServer: !this.state.modalEditServer });

  removeServer = async (server) => {
    const serv = this.state.servers.filter(data => data.id !== server.id);
    console.log("Removing server -> ", server);
    localStorage.setItem('servers', JSON.stringify(serv));
    this.fetchData();
  }

  handleSubmitNewServer = data => {
    const servers = [...this.state.servers, data];
    localStorage.setItem('servers', JSON.stringify(servers));
    this.fetchData();
    this.toggleModalNewServer();
  }

  editServer = data => {
    this.setState({ serverEdit: data });
    this.toggleModalEditServer();
  }

  handleSubmitEditServer = data => {
    const servers = this.state.servers.map(server => {
      console.log("server -> ", server);
      if(server.id === Number(data.id)) {
        server.name = data.name;
        server.url = data.url;
        server.port = data.port;
        server.post_url = data.post_url;
      }
      return server;
    })
    localStorage.setItem('servers', JSON.stringify(servers));
    this.setState({ servers });
    this.toggleModalEditServer();
    console.log("handleSubmitEditServer -> ", data, servers);
  }

  render() {
    const { servers, serverEdit, modalNewServer, modalEditServer } = this.state;
    return (
      <div className="app">
        <h1>Servers <Button variant="light" onClick={() => this.toggleModalNewServer()}><FaPlus /></Button></h1>
  
        <table className="table">
          <thead>
            <tr>     
              <th>Status</th>
              <th>Name</th>
              <th>URL</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server, index) => (
              <tr key={index}>
                <td><span className={`status status-${server.status}`}></span></td>
                <td>{server.name}</td>
                <td><a href={server.buildURL()}>{server.buildURL()}</a></td>
                <td>
                  <Button variant="primary" onClick={() => this.editServer(server)}><FaPen /></Button>
                </td>
                <td>
                  <Button variant="danger" onClick={() => this.removeServer(server)}><FaTrashAlt /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <Modal show={modalEditServer} onHide={this.toggleModalEditServer}>
          <Unform onSubmit={this.handleSubmitEditServer} initialData={serverEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Server</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Id</Form.Label>
                <Input className="form-control" type="number" name="id" disabled />
              </Form.Group>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Input className="form-control" type="text" name="name" placeholder="Enter server name" />
              </Form.Group>
              <Form.Group>
                <Form.Label>URL</Form.Label>
                <Input className="form-control" type="text" name="url" placeholder="Enter server's URL" />
              </Form.Group>
              <Form.Group>
                <Form.Label>Port</Form.Label>
                <Input className="form-control" type="text" name="port" placeholder="Enter server's port" />
              </Form.Group>
              <Form.Group>
                <Form.Label>Post URL</Form.Label>
                <Input className="form-control" type="text" name="post_url" placeholder="Enter server's post url" />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.toggleModalEditServer}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Modal.Footer>
          </Unform>
        </Modal>
  
        <Modal show={modalNewServer} onHide={this.toggleModalNewServer}>
          <Unform onSubmit={this.handleSubmitNewServer}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Server</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Input className="form-control" type="text" name="name" placeholder="Enter server name" />
              </Form.Group>
              <Form.Group>
                <Form.Label>URL</Form.Label>
                <Input className="form-control" type="text" name="url" placeholder="Enter server's URL" />
              </Form.Group>
              <Form.Group>
                <Form.Label>Port</Form.Label>
                <Input className="form-control" type="text" name="port" placeholder="Enter server's port" />
              </Form.Group>
              <Form.Group>
                <Form.Label>Post URL</Form.Label>
                <Input className="form-control" type="text" name="post_url" placeholder="Enter server's post url" />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.toggleModalNewServer}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Modal.Footer>
          </Unform>
        </Modal>

      </div>
    )
  }

}
