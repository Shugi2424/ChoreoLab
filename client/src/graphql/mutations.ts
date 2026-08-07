import { gql } from "@apollo/client";

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      coach {
        id
        email
        firstName
        lastName
        club
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      coach {
        id
        email
        firstName
        lastName
        club
        createdAt
      }
    }
  }
`;
