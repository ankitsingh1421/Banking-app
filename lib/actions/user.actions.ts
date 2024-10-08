'use server';

import { ID, PasswordHash, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";

import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from "next/cache";
// import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const response = await account.createEmailPasswordSession(email, password);

    // cookies().set("appwrite-session", session.secret, {
    //   path: "/",
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: true,
    // });

    // const user = await getUserInfo({ userId: session.userId }) 

    return parseStringify(response);
  } catch (error) {
    console.error('Error', error);
  }
}

// export const signUp = async (userData : SignUpParams) => {
//   const { email, firstName, lastName } = userData; 
//   try {
//     const { account } = await createAdminClient();

//     const newUserAccount = await account.create(
//       ID.unique(), 
//       email, 
//       PasswordHash, 
//       `${firstName} ${lastName}`
//     );

//     if(!newUserAccount) throw new Error('Error creating user')

//     // const dwollaCustomerUrl = await createDwollaCustomer({
//     //   ...userData,
//     //   type: 'personal'
//     // })

//     // if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')

//     // const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

//     // const newUser = await database.createDocument(
//     //   DATABASE_ID!,
//     //   USER_COLLECTION_ID!,
//     //   ID.unique(),
//     //   {
//     //     ...userData,
//     //     userId: newUserAccount.$id,
//     //     // dwollaCustomerId,
//     //     // dwollaCustomerUrl
//     //   }
//     // )

//     const session = await account.createEmailPasswordSession(email, password);

//     cookies().set("appwrite-session", session.secret, {
//       path: "/",
//       httpOnly: true,
//       sameSite: "strict",
//       secure: true,
//     });

//     return parseStringify(newUserAccount);
//   } catch (error) {
//     console.error('Error', error);
//   }
// }
export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;

  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password, 
      `${firstName} ${lastName}`
    );
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    // const result = await account.get();

    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    console.log(error)
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token })
  } catch (error) {
    console.log(error);
  }
}

