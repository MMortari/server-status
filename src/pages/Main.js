import React, { useEffect, useState } from 'react';
import { FaPen, FaTrashAlt } from 'react-icons/fa';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default function Main() {
  const [servers, setServers] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get('http://localhost:3030/servers');

      const newServers = data.map(server => ({
        ...server,
        status: "warn",
        buildURL() { return `${this.url}${this.port}${this.post_url}`}
      }))

      console.log("Initial servers -> ", newServers);
      setServers(newServers);
    }

    fetchData();

    setTimeout(async () => {
      await watchStatus();
    }, 5000);

  }, []);

  useEffect(() => {
    // watchStatus();
    // setTimeout(async () => {
    //   await watchStatus();
    // }, 1000);
  }, [servers])

  const watchStatus = async () => {
    console.log("Server Watch -> ", servers)
    await servers.map(async server => {
      try {
        await axios.get(server.buildURL());

        const serv = servers.map(data => {
          if(data.id === server.id) {
            return { ...data, status: 'up' }
          }
          return data;
        })

        if(serv !== servers) {
          setServers(serv);
          sendNotification(`You server ${server.name} is up`);
        }
      } catch(err) {
        const serv = servers.map(data => {
          if(data.id === server.id) {
            return { ...data, status: 'down' }
          }
          return data;
        })

        if(serv !== servers) {
          setServers(serv);
          sendNotification(`You server ${server.name} is down`);
        }
      }
    })

    console.log("servers -> ", servers);

    setTimeout(async () => {
      await watchStatus();
    }, 5000);
  }

  const removeServer = async (server) => {
    console.log("Serverasdad -> ", server)
  }

  function openEdit(id) {
    // handleShow();
    sendNotification(`Editing server -> ${id}`);
  }

  const sendNotification = (msg) => {
    ipcRenderer.send('notification', msg);
  }

  return (
    <div className="app">
      <h1>Servers </h1>

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
                <Button variant="primary" onClick={() => openEdit(server.id)}><FaPen /></Button>
              </td>
              <td>
                <Button variant="danger" onClick={() => removeServer(server)}><FaTrashAlt /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )

}