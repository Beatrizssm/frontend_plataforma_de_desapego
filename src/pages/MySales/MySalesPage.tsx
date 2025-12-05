/**
 * Página "Minhas vendas / doações"
 * Design conforme imagem fornecida
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { itemService, Item, ItemStatus } from "../../services/itemService";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export function MySalesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<"sales" | "purchases">("sales");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const allItems = await itemService.getAllItems();
        const userItems = allItems.filter((item) => item.ownerId === user.id);
        setItems(userItems);
      } catch (error: any) {
        toast.error("Erro ao carregar itens: " + (error.message || "Erro desconhecido"));
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [user]);

  const handleViewChange = (view: "sales" | "purchases") => {
    setSelectedView(view);
    setIsDropdownOpen(false);
  };

  const handleEdit = (item: Item) => {
    navigate(`/edit-item/${item.id}`);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await itemService.deleteItem(itemToDelete.id);
      toast.success("Item excluído com sucesso!");
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao excluir item: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const getStatusLabel = (status: ItemStatus) => {
    const labels = {
      DISPONIVEL: "Disponível",
      RESERVADO: "Reservado",
      DOADO_VENDIDO: "Doado/Vendido",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: ItemStatus) => {
    const colors = {
      DISPONIVEL: "text-green-600",
      RESERVADO: "text-yellow-600",
      DOADO_VENDIDO: "text-gray-500",
    };
    return colors[status] || "text-[#5941F2]";
  };

  const getAvailableStatuses = (currentStatus: ItemStatus): ItemStatus[] => {
    const transitions: Record<ItemStatus, ItemStatus[]> = {
      DISPONIVEL: ["DISPONIVEL", "RESERVADO", "DOADO_VENDIDO"],
      RESERVADO: ["RESERVADO", "DISPONIVEL", "DOADO_VENDIDO"],
      DOADO_VENDIDO: ["DOADO_VENDIDO"], // Status final
    };
    return transitions[currentStatus] || [currentStatus];
  };

  const handleStatusChange = async (item: Item, newStatus: ItemStatus) => {
    if (item.status === newStatus) return;

    try {
      await itemService.updateItemStatus(item.id, newStatus);
      toast.success("Status atualizado com sucesso!");
      // Atualizar item na lista
      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus, available: newStatus === "DISPONIVEL" } : i));
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + (error.message || "Erro desconhecido"));
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      {/* Header Customizado */}
      <header className="bg-[#5941F2] text-white shadow-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo no canto superior esquerdo */}
            <img 
              src="/Captura de tela 2025-11-28 005239.png" 
              alt="DESAPEGA" 
              className="h-16 w-auto"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />

            {/* Botão Voltar no canto superior direito */}
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="bg-white text-[#5941F2] border-white hover:bg-white/90"
            >
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Dropdown de Seleção */}
        <div className="mb-4 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full max-w-md text-left text-xl font-bold text-[#3A3A3A] bg-transparent border-none cursor-pointer p-0"
          >
            <span>
              {selectedView === "sales" ? "Minhas vendas / doações" : "Minhas compras / trocas"}
            </span>
            {isDropdownOpen ? (
              <ChevronUp className="h-6 w-6 ml-2" />
            ) : (
              <ChevronDown className="h-6 w-6 ml-2" />
            )}
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white border-2 border-[rgba(48,48,48,0.2)] rounded-xl shadow-lg z-10">
              <button
                onClick={() => handleViewChange("purchases")}
                className={`w-full text-left px-3 py-2 text-sm ${
                  selectedView === "purchases"
                    ? "bg-[#F2F2F2] text-[#3A3A3A] font-semibold"
                    : "text-[#3A3A3A] hover:bg-gray-50"
                }`}
              >
                Minhas compras / trocas
              </button>
              <button
                onClick={() => handleViewChange("sales")}
                className={`w-full text-left px-3 py-2 text-sm border-t border-[rgba(48,48,48,0.1)] ${
                  selectedView === "sales"
                    ? "bg-[#F2F2F2] text-[#3A3A3A] font-semibold"
                    : "text-[#3A3A3A] hover:bg-gray-50"
                }`}
              >
                Minhas vendas / doações
              </button>
            </div>
          )}
        </div>

        {/* Cards de Itens */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5941F2] mx-auto mb-4"></div>
              <p className="text-[#3A3A3A]">Carregando itens...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#3A3A3A]">Nenhum item encontrado</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border-2 border-[rgba(48,48,48,0.1)] shadow-sm p-4"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Informações da Data */}
                  <div className="flex items-center gap-2 text-xs text-[#3A3A3A] mb-3 md:mb-0 md:w-28">
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  {/* Imagem do Produto */}
                  <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-2">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/96?text=Sem+Imagem"}
                      alt={item.title}
                      className="max-w-24 max-h-24 w-auto h-auto object-contain rounded-lg"
                    />
                  </div>

                  {/* Detalhes do Produto */}
                  <div className="flex-1">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${getStatusColor(item.status)} font-semibold`}>
                          {getStatusLabel(item.status)}
                        </span>
                        <Select
                          value={item.status}
                          onValueChange={(value) => handleStatusChange(item, value as ItemStatus)}
                        >
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatuses(item.status).map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="text-[#3A3A3A] font-medium">
                        {item.title}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        onClick={() => navigate(`/item/${item.id}`)}
                        variant="outline"
                        className="border-[#5941F2] text-[#5941F2] bg-white hover:bg-[#5941F2] hover:text-white text-xs"
                      >
                        Exibir produto
                      </Button>
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        className="border-[#5941F2] text-[#5941F2] bg-white hover:bg-[#5941F2] hover:text-white text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(item)}
                        variant="destructive"
                        className="text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer com logo no canto inferior direito */}
      <footer className="bg-[#5941F2] text-white mt-auto relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Conheça-nos */}
            <div>
              <h3 className="font-semibold mb-4">Conheça-nos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white hover:underline transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:underline transition-colors">
                    Sobre o Criador
                  </a>
                </li>
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h3 className="font-semibold mb-4">Ajuda</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white hover:underline transition-colors">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Logo no canto inferior direito - posicionamento absoluto */}
          <div className="absolute bottom-32 right-4 sm:right-6 lg:right-8">
            <img 
              src="/ativo-1-10-1.png" 
              alt="DESAPEGA" 
              className="h-16 w-auto"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/90">
            <p>&copy; 2025 Beatriz. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{itemToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

