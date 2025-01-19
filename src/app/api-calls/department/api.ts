const getAllPaymentModes = async () => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/payment-modes`
    );

    return response.json();
  } catch (e) {
    throw e;
  }
};

const getAllNonEnergyTypes = async () => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/non-energy-types`
    );

    return response.json();
  } catch (e) {
    throw e;
  }
};

const getLevelsDiscomId = async (id: string) => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structures/${id}/next-level`
    );
    return response.json();
  } catch (e) {
    throw e;
  }
};

export { getAllPaymentModes, getAllNonEnergyTypes, getLevelsDiscomId };
