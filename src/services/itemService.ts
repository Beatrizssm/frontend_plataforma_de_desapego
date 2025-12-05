/**
 * Serviço de itens
 * Integração com backend /api/items/*
 */

import api from "./api";
import logger from "../utils/logger";

export type ItemStatus = "DISPONIVEL" | "RESERVADO" | "DOADO_VENDIDO";

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  available: boolean;
  status: ItemStatus;
  imageUrl?: string | null;
  ownerId: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  available?: boolean;
  status?: ItemStatus;
  imageUrl?: string;
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  price?: number;
  available?: boolean;
  status?: ItemStatus;
  imageUrl?: string;
}

export interface ItemsResponse {
  success: boolean;
  message: string;
  data: Item[];
}

export interface ItemResponse {
  success: boolean;
  message: string;
  data: Item;
}

class ItemService {
  /**
   * Busca todos os itens
   */
  async getAllItems(): Promise<Item[]> {
    try {
      const response = await api.get<ItemsResponse>("/items");
      logger.info("Itens carregados", { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error) {
      logger.error("Erro ao carregar itens", error);
      throw error;
    }
  }

  /**
   * Busca um item por ID
   */
  async getItemById(id: number): Promise<Item> {
    try {
      logger.debug("Buscando item por ID", { itemId: id });
      const response = await api.get<ItemResponse>(`/items/${id}`);
      logger.info("Item carregado", { itemId: id, title: response.data.title });
      return response.data;
    } catch (error) {
      logger.error("Erro ao carregar item", { itemId: id, error });
      throw error;
    }
  }

  /**
   * Cria um novo item (requer autenticação)
   */
  async createItem(data: CreateItemData): Promise<Item> {
    try {
      logger.info("Criando novo item", { title: data.title });
      const response = await api.post<ItemResponse>("/items", data);
      logger.info("Item criado com sucesso", { itemId: response.data.id, title: response.data.title });
      return response.data;
    } catch (error) {
      logger.error("Erro ao criar item", { title: data.title, error });
      throw error;
    }
  }

  /**
   * Atualiza um item (requer autenticação e ser dono)
   */
  async updateItem(id: number, data: UpdateItemData): Promise<Item> {
    try {
      logger.info("Atualizando item", { itemId: id, updates: Object.keys(data) });
      const response = await api.put<ItemResponse>(`/items/${id}`, data);
      logger.info("Item atualizado com sucesso", { itemId: id });
      return response.data;
    } catch (error) {
      logger.error("Erro ao atualizar item", { itemId: id, error });
      throw error;
    }
  }

  /**
   * Deleta um item (requer autenticação e ser dono)
   */
  async deleteItem(id: number): Promise<void> {
    try {
      logger.info("Deletando item", { itemId: id });
      await api.delete(`/items/${id}`);
      logger.info("Item deletado com sucesso", { itemId: id });
    } catch (error) {
      logger.error("Erro ao deletar item", { itemId: id, error });
      throw error;
    }
  }

  /**
   * Atualiza o status de um item (requer autenticação e ser dono)
   */
  async updateItemStatus(id: number, status: ItemStatus): Promise<Item> {
    try {
      logger.info("Atualizando status do item", { itemId: id, status });
      const response = await api.patch<ItemResponse>(`/items/${id}/status`, { status });
      logger.info("Status do item atualizado com sucesso", { itemId: id, status });
      return response.data;
    } catch (error) {
      logger.error("Erro ao atualizar status do item", { itemId: id, status, error });
      throw error;
    }
  }

  /**
   * Reserva um item disponível (qualquer usuário autenticado pode reservar)
   */
  async reserveItem(id: number): Promise<Item> {
    try {
      logger.info("Reservando item", { itemId: id });
      const response = await api.post<ItemResponse>(`/items/${id}/reserve`);
      logger.info("Item reservado com sucesso", { itemId: id });
      return response.data;
    } catch (error) {
      logger.error("Erro ao reservar item", { itemId: id, error });
      throw error;
    }
  }

  /**
   * Compra um item disponível ou reservado (qualquer usuário autenticado pode comprar)
   */
  async buyItem(id: number): Promise<Item> {
    try {
      logger.info("Comprando item", { itemId: id });
      const response = await api.post<ItemResponse>(`/items/${id}/buy`);
      logger.info("Item comprado com sucesso", { itemId: id });
      return response.data;
    } catch (error) {
      logger.error("Erro ao comprar item", { itemId: id, error });
      throw error;
    }
  }
}

export const itemService = new ItemService();
export default itemService;

