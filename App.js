import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { Icon, Divider } from "react-native-elements";

import React from "react";
import {
  Alert,
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  Modal,
  Share,
  StyleSheet,
  Text,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { LogBox } from "react-native";
import { nanoid } from "nanoid/non-secure";
import Environment from "./config/environment";
import firebase from "./config/firebase";

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    modalVisible: false,
  };

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  componentDidMount() {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
  }

  render() {
    let { image } = this.state;
    const { modalVisible } = this.state;

    return (
      <View style={styles.container}>
        {/* <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            marginTop: 120,
          }}
        > */}
        <View style={styles.getStartedContainer}>
          {image ? null : (
            <Text style={styles.getStartedText}>Image Recognition DEMO</Text>
          )}
        </View>

        <Modal
          animationType="fade"
          // transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* <Icon link name="close" /> */}
              <Icon
                raised
                name="close"
                type="font-awesome"
                color="#0080FE"
                textSize="10"
                onPress={() => {
                  this.setModalVisible(!modalVisible);
                }}
              />
              <Text style={styles.modalText}>
                Pick an image or Take a photo
              </Text>
              {/* <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                  onPress={() => {
                    this.setModalVisible(!modalVisible);
                  }}
                >
                  <Text style={styles.textStyle}>Hide Modal</Text>
                </TouchableHighlight> */}

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={async (e) => {
                  await this._pickImage();
                  this.setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.textStyle}>
                  Pick an image from camera roll
                </Text>
              </TouchableHighlight>

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={async (e) => {
                  await this._takePhoto();
                  this.setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.textStyle}>Take a photo</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <View style={styles.getStartedContainer}>
          {image ? null : (
            <TouchableHighlight
              style={styles.imgTab}
              onPress={() => {
                this.setModalVisible(true);
              }}
            >
              <Text style={styles.textStyle}>Pick Image</Text>
            </TouchableHighlight>
          )}
        </View>

        <View style={styles.helpContainer}>
          {this._maybeRenderImage()}
          {this._maybeRenderUploadingOverlay()}

          {this.state.googleResponse && (
            <ScrollView vertical={true}>
              <SafeAreaView style={styles.areaContainer}>
                <FlatList
                  data={this.state.googleResponse.responses[0].labelAnnotations}
                  extraData={this.state}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        borderBottomColor: "#DCDCDC",
                        borderBottomWidth: 1,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={styles.textList}>
                        Item: {item.description}
                        {"      \n"}
                        Score: {parseInt(item.score * 100) + "%"}
                      </Text>
                    </View>
                  )}
                />
              </SafeAreaView>
            </ScrollView>
          )}
        </View>
        {/* </ScrollView> */}
      </View>
    );
  }

  organize = (array) => {
    return array.map(function (item, i) {
      return (
        <View key={i}>
          <Text>{item}</Text>
        </View>
      );
    });
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image, googleResponse } = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 20,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity onPress={() => {
                this.setModalVisible(true);
              }}>
            <Image
              source={{ uri: image }}
              style={{
                width: 250,
                height: 250,
                borderRadius: 20,
                overflow: "hidden",
              }}
            />
          </TouchableOpacity>
        </View>
        <TouchableHighlight
          style={styles.analyzeButton}
          onPress={() => this.submitToGoogle()}
        >
          <Text style={{ fontSize: 16, color: "#2196F3", textAlign: "center" }}>
            Analyze!
          </Text>
        </TouchableHighlight>

        <Text
          // onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}
        />

        {/* <Text>Raw JSON:</Text> */}

        {googleResponse && (
          <Text
            // onPress={this._copyToClipboard}
            // onLongPress={this._share}
            style={{
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Lists
          </Text>
        )}
      </View>
    );
  };

  // _keyExtractor = (item, index) => item.id;

  _renderItem = (item) => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  _share = () => {
    Share.share({
      message: JSON.stringify(this.state.googleResponse.responses),
      title: "Check it out",
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert("Copied to clipboard");
  };

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async (pickerResult) => {
    try {
      this.setState({ uploading: true });
      console.log("uploading: true");

      if (!pickerResult.cancelled) {
        console.log("enter pickerResult");
        const uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: uploadUrl });
        console.log("uploadUrl");
      } else {
        console.log("FAIL");
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      this.setState({ uploading: false });
    }
  };

  submitToGoogle = async () => {
    try {
      this.setState({ uploading: true });
      let { image } = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: "LABEL_DETECTION", maxResults: 10 },
              { type: "LANDMARK_DETECTION", maxResults: 5 },
              { type: "FACE_DETECTION", maxResults: 5 },
              // { type: "LOGO_DETECTION", maxResults: 5 },
              { type: "TEXT_DETECTION", maxResults: 5 },
              // { type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
              { type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
              // { type: "IMAGE_PROPERTIES", maxResults: 5 },
              { type: "CROP_HINTS", maxResults: 5 },
              { type: "WEB_DETECTION", maxResults: 5 },
            ],
            image: {
              source: {
                imageUri: image,
              },
            },
          },
        ],
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          Environment["GOOGLE_CLOUD_VISION_API_KEY"],
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: body,
          encoding: 'base64',
        }
      );
      let responseJson = await response.json();
      console.log(responseJson);
      this.setState({
        googleResponse: responseJson,
        uploading: false,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const ref = firebase.storage().ref().child(nanoid());
  const snapshot = await ref.put(blob);

  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  areaContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textList: {
    fontSize: 16,
    padding: 4,
  },

  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },

  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },

  getStartedText: {
    fontSize: 22,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  helpContainer: {
    marginTop: 2,
    alignItems: "center",
   
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imgTab: {
    backgroundColor: "#2196F3",
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 10,
  },
  analyzeButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 10,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
