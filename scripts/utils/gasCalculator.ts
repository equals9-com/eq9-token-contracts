import { BigNumber, utils } from "ethers";
import axios from "axios";

export class PolygonGasCalculatorService {
  public gasStationUrl = "https://gasstation-mainnet.matic.network/v2";

  /**
   *
   * @returns maxFeePerGas and maxPriorityFeePerGas BigNumbers from ethers package
   */
  async calcGas() {
    let maxFeePerGas = BigNumber.from("40000000000"); // fallback to 40 gwei
    let maxPriorityFeePerGas = BigNumber.from("40000000000"); // fallback to 40 gwei
    try {
      const { data } = await axios.get(this.gasStationUrl);
      maxFeePerGas = utils.parseUnits(`${Math.ceil(data.fast.maxFee)}`, "gwei");

      maxPriorityFeePerGas = utils.parseUnits(
        `${Math.ceil(data.fast.maxPriorityFee)}`,
        "gwei"
      );
    } catch (e) {
      console.error(e);
    }

    return { maxFeePerGas, maxPriorityFeePerGas };
  }
}
