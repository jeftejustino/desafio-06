import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    loadingMore: false,
    user: {},
    page: 1,
    itsAll: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, user, loading: false });
  }

  async nextPage() {
    const { user, itsAll, stars, page } = this.state;
    const p = page + 1;
    if (itsAll) return;
    this.setState({ loadingMore: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: p,
      },
    });

    if (response.data.length < 30) this.setState({ itsAll: true });

    this.setState({
      stars: [...stars, ...response.data],
      loadingMore: false,
      page: p,
    });
  }

  async refreshList() {
    const { user } = this.state;
    this.setState({ refreshing: true });
    const p = 1;
    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: p,
      },
    });

    this.setState({ page: p, stars: response.data, refreshing: false });
  }

  handleRepository = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { stars, user, loading, loadingMore, refreshing } = this.state;
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading>
            <ActivityIndicator size="large" />
          </Loading>
        ) : (
          <Stars
            onRefresh={() => this.refreshList()}
            refreshing={refreshing}
            onEndReached={() => this.nextPage()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator /> : ''}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleRepository(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
